// Keep every search capture on the same mobile density and assert stable layout.
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pillnote/app/app_services.dart';
import 'package:pillnote/main.dart';
import 'package:pillnote/screen/features/pillsearch.dart';
import 'package:pillnote/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import 'helpers/fake_dose_reminder_gateway.dart';
import 'website_capture_test.dart' as capture;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  tz_data.initializeTimeZones();
  testWidgets('search focus keeps the same mobile layout', (tester) async {
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
    SharedPreferences.setMockInitialValues({'onboarding_completed': true, 'startup_permissions_requested': true});
    await AppServices.initialize(reminderGateway: FakeDoseReminderGateway(tz.getLocation('Asia/Seoul')));
    addTearDown(AppServices.instance.dispose);
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();
    final theme = Theme.of(tester.element(find.byType(NavigationBar))).copyWith(
      platform: TargetPlatform.android, visualDensity: VisualDensity.standard,
    );
    final existing = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/src/capture-dates.json').readAsString()))!) as Map;
    for (final entry in existing.entries) {
      capture.dateOverlays[entry.key as String] = (entry.value as List).map((label) => Map<String, dynamic>.from(label)).toList();
    }
    final api = ApiClient(baseUrl: 'https://capture.invalid', client: MockClient((_) async => http.Response(jsonEncode({
      'data': [
        {'itemSeq': 'capture-vitamin-d', 'name': '비타민 D', 'manufacturer': '소개용 예시'},
        {'itemSeq': 'capture-vitamin-c', 'name': '비타민 C', 'manufacturer': '소개용 예시'},
      ], 'meta': {'stale': false},
    }), 200, headers: {'content-type': 'application/json; charset=utf-8'})));
    await capture.pumpPage(tester, theme, Pillsearch(apiClient: api));
    final field = find.byType(TextField).first;
    final guide = find.text('포장에 적힌 이름으로 찾아보세요');
    final beforeField = tester.getRect(field);
    final beforeGuide = tester.getRect(guide);
    await capture.capture(tester, 'search-empty');
    await tester.tap(field);
    await tester.pumpAndSettle();
    expect(tester.getRect(field), beforeField);
    expect(tester.getRect(guide), beforeGuide);
    await capture.capture(tester, 'search-focused');
    capture.reportPoint(tester, 'search.field', field);
    capture.reportPoint(tester, 'search.editable', find.byType(EditableText));
    final editable = tester.widget<EditableText>(find.byType(EditableText));
    print('SEARCH STYLE ${editable.style}');
    await tester.enterText(field, '비타민');
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pumpAndSettle();
    expect(tester.getRect(field), beforeField);
    await capture.capture(tester, 'search-typed');
    capture.reportPoint(tester, 'search.result', find.text('비타민 D'));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpAndSettle();
    debugDefaultTargetPlatformOverride = null;
    expect(tester.takeException(), isNull);
  });
}
