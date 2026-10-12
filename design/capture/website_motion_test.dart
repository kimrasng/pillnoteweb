// Genuine Flutter raster frames. The website samples these using scroll position.
// Accounts, catalogue and pharmacies are isolated fixtures; production is untouched.
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pillnote/app/app_services.dart';
import 'package:pillnote/main.dart';
import 'package:pillnote/screen/main.dart';
import 'package:pillnote/screen/features/pillsearch.dart';
import 'package:pillnote/screen/management/medication_form.dart';
import 'package:pillnote/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import 'helpers/fake_dose_reminder_gateway.dart';
import 'native_capture_support.dart' as capture;

final clips = <String, Map<String, dynamic>>{};

Future<void> snapshot(WidgetTester tester, String name, {bool realIO = false}) async {
  for (final element in find.byType(ScaffoldMessenger).evaluate()) {
    ((element as StatefulElement).state as ScaffoldMessengerState).removeCurrentSnackBar();
  }
  await tester.pump();
  if (realIO) {
    await capture.saveBoundary(tester, name);
  } else {
    await tester.runAsync(() => capture.saveBoundary(tester, name));
  }
}

Future<void> record(WidgetTester tester, String from, String to,
    Future<void> Function() action, {int milliseconds = 640, bool realIO = false, Finder? pressTarget, bool overridePress = false}) async {
  final id = '$from--$to';
  final frames = <String>[from];
  final point = pressTarget == null ? null : tester.getCenter(pressTarget);
  final press = point == null ? null : await tester.startGesture(point);
  if (press == null) await action();
  await tester.pump();
  // Sample the engine clock at 60 fps. No pumpAndSettle until the clip ends.
  for (var tick = 0; tick <= milliseconds ~/ 16; tick++) {
    if (tick == 4 && press != null) {
      if (overridePress) {
        await press.cancel();
        await action();
      } else {
        await press.up();
      }
      await tester.pump();
    }
    final name = 'native/$id/${tick.toString().padLeft(3, '0')}';
    await snapshot(tester, name, realIO: realIO);
    frames.add(name);
    await tester.pump(const Duration(milliseconds: 16));
  }
  // An iOS page route takes 500 ms after the 64 ms press. Its final movement
  // must be captured above, rather than skipped by the endpoint settle below.
  final routes = find.byType(Scaffold).evaluate()
      .map((element) => ModalRoute.of(element)).whereType<PageRoute<dynamic>>().toSet();
  for (final route in routes) {
    for (final animation in [route.animation, route.secondaryAnimation]) {
      expect(animation?.status, isNot(isIn([AnimationStatus.forward, AnimationStatus.reverse])),
          reason: '$id must capture the complete iOS route before settling');
    }
  }
  await tester.pumpAndSettle();
  await snapshot(tester, to, realIO: realIO);
  frames.add(to);
  clips[id] = {'from': from, 'to': to, 'fps': 60, 'frames': frames};
  if (point != null) {
    clips[id]!['pressReleaseIndex'] = 5;
    clips[id]!['touches'] = [{'x': point.dx, 'y': point.dy, 'startIndex': 0, 'releaseIndex': 5, 'endIndex': 14}];
  }
  // ignore: avoid_print
  print('NATIVE $id: ${frames.length} Flutter frames');
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  tz_data.initializeTimeZones();
  testWidgets('capture Flutter routes, controls, focus and time dialogs', (tester) async {
    debugDefaultTargetPlatformOverride = TargetPlatform.linux;
    addTearDown(() => debugDefaultTargetPlatformOverride = null);
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    tester.view.padding = const FakeViewPadding(top: 54, bottom: 34);
    tester.view.viewPadding = const FakeViewPadding(top: 54, bottom: 34);
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetPadding);
    addTearDown(tester.view.resetViewPadding);
    for (final font in [('Pretendard', 'fonts/Pretendard.ttf'), ('MaterialIcons', 'fonts/MaterialIcons-Regular.otf')]) {
      await (FontLoader(font.$1)..addFont(rootBundle.load(font.$2))).load();
    }
    final existing = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/src/capture-dates.json').readAsString()))!) as Map;
    for (final entry in existing.entries) {
      capture.dateOverlays[entry.key as String] = (entry.value as List).map((label) => Map<String, dynamic>.from(label)).toList();
    }
    SharedPreferences.setMockInitialValues({
      'onboarding_completed': true, 'startup_permissions_requested': true,
      'user_pills': jsonEncode([
        {'id': 'morning', 'ITEM_NAME': '아침 처방약', 'times': ['08:00'], 'dosage': 1, 'unit': '정', 'stock': 14, 'trackStock': true},
        {'id': 'evening', 'ITEM_NAME': '저녁 처방약', 'times': ['20:00'], 'dosage': 1, 'unit': '정', 'stock': 14, 'trackStock': true},
      ]),
    });
    final gateway = FakeDoseReminderGateway(tz.getLocation('Asia/Seoul'))..granted = false;
    await AppServices.initialize(reminderGateway: gateway);
    addTearDown(AppServices.instance.dispose);
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();
    final theme = Theme.of(tester.element(find.byType(NavigationBar))).copyWith(platform: TargetPlatform.iOS, visualDensity: VisualDensity.standard);
    await capture.pumpPage(tester, theme, const Main());
    await snapshot(tester, 'home-start');
    final boxTab = find.descendant(of: find.byType(NavigationBar), matching: find.text('내 약 상자'));
    final homeTab = find.descendant(of: find.byType(NavigationBar), matching: find.text('홈'));
    await record(tester, 'home-start', 'box-start', () async {}, pressTarget: boxTab);

    final catalogue = ApiClient(baseUrl: 'https://capture.invalid', client: MockClient((_) async => http.Response(jsonEncode({
      'data': [
        {'itemSeq': 'capture-vitamin-d', 'name': '비타민 D', 'manufacturer': '소개용 예시'},
        {'itemSeq': 'capture-vitamin-c', 'name': '비타민 C', 'manufacturer': '소개용 예시'},
      ], 'meta': {'stale': false},
    }), 200, headers: {'content-type': 'application/json; charset=utf-8'})));
    final navigator = tester.state<NavigatorState>(find.byType(Navigator).first);
    await record(tester, 'box-start', 'search-empty', () async {
      navigator.push(MaterialPageRoute<void>(builder: (_) => Pillsearch(apiClient: catalogue)));
    }, pressTarget: find.text('약 추가'), overridePress: true);
    await record(tester, 'search-empty', 'search-focused', () async {}, pressTarget: find.byType(TextField).first, milliseconds: 240);

    // TextInput sends real Korean composing ranges to Flutter's EditableText.
    final typing = <String>['', 'ㅂ', '비', '빝', '비타', '비탐', '비타미', '비타민', '비타민'];
    final typingFrames = <String>['search-focused'];
    for (var i = 1; i < typing.length; i++) {
      final text = typing[i];
      tester.testTextInput.updateEditingValue(TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length), composing: i < 8 ? TextRange(start: i < 4 ? 0 : i < 6 ? 1 : 2, end: text.length) : TextRange.empty));
      await tester.pump(const Duration(milliseconds: 24));
      final name = 'native/search-focused--search-typed/${i.toString().padLeft(3, '0')}';
      await snapshot(tester, name);
      typingFrames.add(name);
    }
    await tester.pump(const Duration(milliseconds: 450));
    await tester.pumpAndSettle();
    await snapshot(tester, 'search-typed');
    typingFrames.add('search-typed');
    clips['search-focused--search-typed'] = {'from': 'search-focused', 'to': 'search-typed', 'fps': 60, 'frames': typingFrames, 'stops': [0, .08, .18, .30, .35, .47, .52, .65, .76, 1]};
    // Keep the search field focused until the result opens its route. Removing
    // focus here would change the endpoint without any captured user action.
    // Same MaterialPageRoute and MedicationForm as the app, with demo schedule data.
    await record(tester, 'search-typed', 'schedule', () async {
      navigator.push(MaterialPageRoute<MedicationFormResult>(builder: (_) => MedicationForm(pill: {
        'ITEM_SEQ': 'capture-vitamin-d', 'ITEM_NAME': '비타민 D', 'ENTP_NAME': '소개용 예시',
        'times': ['13:00'], 'dosage': 1, 'unit': '정', 'stock': 30, 'trackStock': true,
      })));
    }, pressTarget: find.text('비타민 D'), overridePress: true);
    await record(tester, 'schedule', 'time-picker', () async {}, pressTarget: find.text('13:00'), milliseconds: 320);
    await record(tester, 'time-picker', 'schedule', () async {}, pressTarget: find.text('확인'), milliseconds: 320);
    await record(tester, 'schedule', 'registered', () async {}, pressTarget: find.text('등록하기'));
    // Capture the real pop rather than sliding an already completed screenshot.
    await record(tester, 'registered', 'home', () async {
      tester.widget<NavigationBar>(find.byType(NavigationBar, skipOffstage: false)).onDestinationSelected!(0);
      navigator.popUntil((route) => route.isFirst);
    }, pressTarget: find.text('완료'), overridePress: true);
    await record(tester, 'home', 'home-taken', () async {}, pressTarget: find.byKey(const ValueKey('dose-morning|08:00')));
    await record(tester, 'home-taken', 'box-taken', () async {}, pressTarget: boxTab);
    expect(AppServices.instance.medications.getPills().first['stock'], 13);
    await record(tester, 'box-taken', 'stock-taken', () async {}, pressTarget: find.text('아침 처방약'));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpAndSettle();
    await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/design/capture/native-clips-main.json').writeAsString(const JsonEncoder.withIndent('  ').convert(clips)));
    debugDefaultTargetPlatformOverride = null;
    expect(tester.takeException(), isNull);
  });
}
