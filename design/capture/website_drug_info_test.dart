// Genuine drug detail page using a preserved public API response and MFDS photo.
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
import 'package:pillnote/screen/features/pillinfo.dart';
import 'package:pillnote/services/api_client.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import 'helpers/fake_dose_reminder_gateway.dart';
import 'native_capture_support.dart' as capture;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  tz_data.initializeTimeZones();
  testWidgets('capture genuine drug information with preserved public guidance', (tester) async {
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
    await capture.loadTylenolCatalogue(tester);
    final existing = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/src/capture-dates.json').readAsString()))!) as Map;
    for (final entry in existing.entries) {
      capture.dateOverlays[entry.key as String] = (entry.value as List).map((label) => Map<String, dynamic>.from(label)).toList();
    }
    final response = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/design/capture/tylenol-detail.json').readAsString()))!);
    final api = ApiClient(baseUrl: 'https://capture.invalid', client: MockClient((request) async {
      expect(request.url.path, '/v1/drugs/202106092');
      return http.Response(jsonEncode(response), 200, headers: {'content-type': 'application/json; charset=utf-8'});
    }));
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();
    final theme = Theme.of(tester.element(find.byType(NavigationBar))).copyWith(platform: TargetPlatform.iOS, visualDensity: VisualDensity.standard);
    await capture.pumpPage(tester, theme, const Scaffold());
    final navigator = tester.state<NavigatorState>(find.byType(Navigator).first);
    navigator.push(MaterialPageRoute<void>(builder: (_) => Pillinfo(pillSEQ: '202106092', isLocal: false, canSelect: false, apiClient: api)));
    await tester.pumpAndSettle();
    expect(find.text('타이레놀정500밀리그람(아세트아미노펜)'), findsOneWidget);
    expect(find.text('효능 · 효과'), findsOneWidget);
    expect(find.text('복용 방법'), findsOneWidget);
    await capture.capture(tester, 'drug-info');
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pumpAndSettle();
    debugDefaultTargetPlatformOverride = null;
    expect(tester.takeException(), isNull);
  });
}
