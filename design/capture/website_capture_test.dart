// Temporary, isolated website asset capture. This does not change production UI.
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pillnote/app/app_services.dart';
import 'package:pillnote/controller/controller.dart';
import 'package:pillnote/main.dart';
import 'package:pillnote/screen/features/pillsearch.dart';
import 'package:pillnote/screen/management/medication_form.dart';
import 'package:pillnote/screen/management/pilmanagement.dart';
import 'package:pillnote/screen/pages/menu.dart';
import 'package:pillnote/screen/pages/distanc.dart';
import 'package:pillnote/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

import 'helpers/fake_dose_reminder_gateway.dart';

const outputDirectory = '/Users/kimrasng/dev/pillnoteweb/public/images/app';
const captureKey = ValueKey('website-screen-capture');
final dateOverlays = <String, List<Map<String, dynamic>>>{};

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  tz_data.initializeTimeZones();

  testWidgets('capture genuine PillNote UI for the website', (tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    tester.view.padding = const FakeViewPadding(top: 54, bottom: 34);
    tester.view.viewPadding = const FakeViewPadding(top: 54, bottom: 34);
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    addTearDown(tester.view.resetPadding);
    addTearDown(tester.view.resetViewPadding);

    for (final font in [
      ('Pretendard', 'fonts/Pretendard.ttf'),
      ('MaterialIcons', 'fonts/MaterialIcons-Regular.otf'),
    ]) {
      final loader = FontLoader(font.$1)..addFont(rootBundle.load(font.$2));
      await loader.load();
    }
    SharedPreferences.setMockInitialValues({
      'onboarding_completed': true,
      'startup_permissions_requested': true,
      'user_pills': jsonEncode([
        {
          'id': 'morning', 'ITEM_NAME': '아침 처방약', 'times': ['08:00'],
          'dosage': 1, 'unit': '정', 'stock': 14, 'trackStock': true,
        },
        {
          'id': 'evening', 'ITEM_NAME': '저녁 처방약', 'times': ['20:00'],
          'dosage': 1, 'unit': '정', 'stock': 14, 'trackStock': true,
        },
      ]),
    });
    final reminderGateway = FakeDoseReminderGateway(tz.getLocation('Asia/Seoul'))
      ..granted = false;
    await AppServices.initialize(reminderGateway: reminderGateway);
    addTearDown(AppServices.instance.dispose);
    await AppServices.instance.reminders.refresh();
    await tester.pumpWidget(
      const RepaintBoundary(key: captureKey, child: MyApp()),
    );
    await tester.pumpAndSettle();
    final theme = Theme.of(tester.element(find.byType(NavigationBar)));
    await capture(tester, 'home-start');
    await tab(tester, '내 약 상자');
    await capture(tester, 'box-start');
    reportPoint(tester, 'box.add', find.text('약 추가'));
    await tab(tester, '홈');
    await Controller.addPill({
      'ITEM_NAME': '비타민 D', 'times': ['13:00'],
      'dosage': 1, 'unit': '정',
    }, 30);
    await tab(tester, '내 약 상자');
    await tab(tester, '홈');
    await capture(tester, 'home');
    reportPoint(tester, 'home.check', find.byKey(const ValueKey('dose-morning|08:00')));

    await tab(tester, '내 약 상자');
    await capture(tester, 'box');
    final boxStock = find.text('남은 약 14정');
    if (boxStock.evaluate().isNotEmpty) reportPoint(tester, 'box.stock', boxStock.first);
    await tab(tester, '홈');
    await tester.tap(find.byKey(const ValueKey('dose-morning|08:00')));
    await tester.pumpAndSettle();
    await tester.pump(const Duration(seconds: 5));
    await tester.pumpAndSettle();
    await capture(tester, 'home-taken');
    await tab(tester, '내 약 상자');
    await capture(tester, 'box-taken');
    expect(Controller.getPills().first['stock'], 13);

    // Real detail screen exposes the stock before/after clearly for closeups.
    await tester.tap(find.text('아침 처방약'));
    await tester.pumpAndSettle();
    await capture(tester, 'stock-taken');
    final stockNumber = find.text('13정 남았어요');
    if (stockNumber.evaluate().isNotEmpty) reportPoint(tester, 'detail.stock', stockNumber.first);
    await Controller.undoIntake('morning', '08:00');
    await pumpPage(tester, theme, const Pilmanagement(pillId: 'morning'));
    await capture(tester, 'stock');
    await Controller.recordIntake('morning', '08:00');
    reminderGateway.granted = true;
    await AppServices.instance.reminders.refresh();

    // Search uses an explicit in-memory public-catalogue fixture. No HTTP request
    // can leave this MockClient, and no drug benefit or dosage is invented.
    final catalogue = ApiClient(
      baseUrl: 'https://capture.invalid',
      client: MockClient((_) async => http.Response(jsonEncode({
        'data': [
          {'itemSeq': 'capture-vitamin-d', 'name': '비타민 D', 'manufacturer': '소개용 예시'},
          {'itemSeq': 'capture-vitamin-c', 'name': '비타민 C', 'manufacturer': '소개용 예시'},
        ],
        'meta': {'stale': false},
      }), 200, headers: {'content-type': 'application/json; charset=utf-8'})),
    );
    await pumpPage(tester, theme, Pillsearch(apiClient: catalogue));
    await capture(tester, 'search-empty');
    await tester.enterText(find.byType(TextField).first, '비타민');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();
    await capture(tester, 'search');
    reportPoint(tester, 'search.result', find.text('비타민 D'));
    reportPoint(tester, 'search.input', find.byType(TextField).first);

    // Use the actual schedule form with the same sample medicine metadata.
    await pumpPage(tester, theme, MedicationForm(pill: {
      'ITEM_SEQ': 'capture-vitamin-d', 'ITEM_NAME': '비타민 D',
      'ENTP_NAME': '소개용 예시', 'times': ['13:00'], 'dosage': 1,
      'unit': '정', 'stock': 30, 'trackStock': true,
    }));
    await capture(tester, 'schedule');
    reportPoint(tester, 'schedule.register', find.text('등록하기'));
    reportPoint(tester, 'schedule.time', find.text('13:00'));
    await tester.tap(find.text('13:00'));
    await tester.pumpAndSettle();
    await capture(tester, 'time-picker');
    reportPoint(tester, 'time.confirm', find.text('확인'));
    await tester.tap(find.text('확인'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('등록하기'));
    await tester.pumpAndSettle();
    await capture(tester, 'registered');

    await pumpPage(tester, theme, const Menu());
    await tester.tap(find.text('내 복용 시간 알림'));
    await tester.pumpAndSettle();
    await capture(tester, 'reminders');
    reportPoint(tester, 'reminders.switch', find.byType(Switch).first);

    // This is the authentic logged-out settings explanation. The guardian screen
    // requires a real account and cannot be populated safely without changing UI.
    await pumpPage(tester, theme, const Menu());
    await capture(tester, 'guardian');
    reportPoint(tester, 'guardian.section', find.text('보호자 연결'));

    // Public map tiles only. The API client was created under Flutter's mocked
    // HttpClient and remains blocked; no pharmacy search or geolocation is invoked.
    await tester.runAsync(() => HttpOverrides.runZoned(() async {
      final tileCache = BuiltInMapCachingProvider.getOrCreateInstance(
        cacheDirectory: '/private/tmp/pillnote-website-capture-map',
        maxCacheSize: 20000000,
      );
      await pumpPage(tester, theme, const Distanc());
      await Future<void>.delayed(const Duration(seconds: 8));
      // Decoding occurs on real I/O, while the widget test owns the animation
      // clock. Advance both so loaded map tiles finish their fade-in.
      for (var frame = 0; frame < 12; frame++) {
        await tester.pump(const Duration(milliseconds: 100));
        await Future<void>.delayed(const Duration(milliseconds: 100));
      }
      await saveBoundary(tester, 'pharmacy-map');
      // Open the original app's attribution control for a screenshot with
      // visible copyright, rather than adding a fabricated map UI.
      await tester.tap(find.byTooltip('Attributions'));
      for (var frame = 0; frame < 8; frame++) {
        await tester.pump(const Duration(milliseconds: 100));
        await Future<void>.delayed(const Duration(milliseconds: 100));
      }
      await saveBoundary(tester, 'pharmacy');
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpAndSettle();
      await tileCache.destroy();
    }, createHttpClient: CaptureHttpOverrides().createHttpClient));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}

class CaptureHttpOverrides extends HttpOverrides {}

Future<void> tab(WidgetTester tester, String label) async {
  await tester.tap(find.descendant(of: find.byType(NavigationBar), matching: find.text(label)));
  await tester.pumpAndSettle();
}

Future<void> pumpPage(WidgetTester tester, ThemeData theme, Widget page) async {
  await tester.pumpWidget(const SizedBox.shrink());
  await tester.pumpAndSettle();
  await tester.pumpWidget(RepaintBoundary(
    key: captureKey,
    child: MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: theme,
      locale: const Locale('ko', 'KR'),
      supportedLocales: const [Locale('ko', 'KR')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: page,
    ),
  ));
  await tester.pumpAndSettle();
}

Future<void> capture(WidgetTester tester, String name) async {
  for (final element in find.byType(ScaffoldMessenger).evaluate()) {
    ((element as StatefulElement).state as ScaffoldMessengerState).removeCurrentSnackBar();
  }
  await tester.pumpAndSettle();
  await tester.runAsync(() => saveBoundary(tester, name));
  // ignore: avoid_print
  print('Captured $name: 780×1688, logical 390×844, SafeArea 54/34');
}

Future<void> saveBoundary(WidgetTester tester, String name) async {
  final originals = <RenderParagraph, InlineSpan>{};
  final labels = <Map<String, dynamic>>[];
  final today = DateUtils.dateOnly(DateTime.now());
  for (final element in find.byType(Text).evaluate()) {
    final widget = element.widget as Text;
    final text = widget.data ?? widget.textSpan?.toPlainText() ?? '';
    String? kind;
    int offset = 0;
    if (RegExp(r'^\d{4}년 \d{1,2}월$').hasMatch(text)) kind = 'month';
    if (RegExp(r'^\d{4}-\d{2}-\d{2}부터').hasMatch(text)) kind = 'start';
    if (text.startsWith('다음 알림 · ')) kind = 'next';
    element.visitAncestorElements((ancestor) {
      final parent = ancestor.widget;
      if (parent is Semantics) {
        final match = RegExp(r'^(\d+)월 (\d+)일').firstMatch(parent.properties.label ?? '');
        if (match != null && (RegExp(r'^\d+$').hasMatch(text) || ['월','화','수','목','금','토','일'].contains(text))) {
          var day = DateTime(today.year, int.parse(match[1]!), int.parse(match[2]!));
          if (day.difference(today).inDays > 180) day = DateTime(today.year - 1, day.month, day.day);
          if (day.difference(today).inDays < -180) day = DateTime(today.year + 1, day.month, day.day);
          offset = DateTime.utc(day.year, day.month, day.day).difference(DateTime.utc(today.year, today.month, today.day)).inDays;
          kind = RegExp(r'^\d+$').hasMatch(text) ? 'day' : 'weekday';
          return false;
        }
      }
      return true;
    });
    if (kind == null) continue;
    final render = element.renderObject;
    if (render is! RenderParagraph) continue;
    final rect = render.localToGlobal(Offset.zero) & render.size;
    if (rect.right <= 0 || rect.left >= 390 || rect.bottom <= 0 || rect.top >= 844) continue;
    final original = render.text;
    final style = (original as TextSpan).style!;
    final color = style.color ?? Colors.black;
    labels.add({
      'kind': kind, 'offset': offset,
      if (kind == 'next') 'times': name == 'registered' ? [13] : [8, 13, 20],
      'x': rect.left, 'y': rect.top, 'width': rect.width, 'height': rect.height,
      'fontSize': style.fontSize, 'fontWeight': (style.fontWeight ?? FontWeight.normal).value,
      'lineHeight': style.height ?? 1.2,
      'color': 'rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.a})',
    });
    originals[render] = original;
    render.text = TextSpan(text: original.toPlainText(), style: style.copyWith(color: Colors.transparent));
  }
  dateOverlays[name] = labels;
  await tester.pump();
  final boundary = tester.renderObject<RenderRepaintBoundary>(find.byKey(captureKey));
  final image = await boundary.toImage(pixelRatio: 2);
  final png = await image.toByteData(format: ui.ImageByteFormat.png);
  final output = File('$outputDirectory/$name.png');
  await output.parent.create(recursive: true);
  await output.writeAsBytes(png!.buffer.asUint8List());
  image.dispose();
  for (final entry in originals.entries) { entry.key.text = entry.value; }
  await File('/Users/kimrasng/dev/pillnoteweb/src/capture-dates.json').writeAsString(const JsonEncoder.withIndent('  ').convert(dateOverlays));
}

void reportPoint(WidgetTester tester, String label, Finder finder) {
  final rect = tester.getRect(finder);
  // ignore: avoid_print
  print('POSITION $label: ${rect.left},${rect.top},${rect.width},${rect.height}; center ${rect.center.dx},${rect.center.dy}');
}
