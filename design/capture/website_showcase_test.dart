// Real application widgets, isolated accounts, and a public pharmacy response.
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:pillnote/services/push_notification_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:pillnote/app/app_services.dart';
import 'package:pillnote/main.dart';
import 'package:pillnote/services/api_client.dart';
import 'package:pillnote/services/session_store.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import 'helpers/fake_dose_reminder_gateway.dart';
import 'capture_pushalarm.dart';
import 'capture_distanc.dart';
import 'website_capture_test.dart' as capture;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  tz_data.initializeTimeZones();
  testWidgets('capture invitation, acceptance, and real Seoul Station pharmacies', (tester) async {
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
    final theme = Theme.of(tester.element(find.byType(NavigationBar)));
    final existing = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/src/capture-dates.json').readAsString()))!) as Map;
    for (final entry in existing.entries) {
      capture.dateOverlays[entry.key as String] = (entry.value as List).map((label) => Map<String, dynamic>.from(label)).toList();
    }
    final owner = SessionStore.inMemory();
    final guardian = SessionStore.inMemory();
    Future<void> login(SessionStore sessions, String id, String email) => sessions.save(UserSession(userId: id, email: email, accessToken: 'capture-$id', refreshToken: 'capture-refresh-$id', accessTokenExpiresIn: 3600, refreshTokenExpiresIn: 3600));
    await login(owner, 'owner', 'family@example.com');
    await login(guardian, 'guardian', 'guardian@example.com');
    Map<String, dynamic>? relationship;
    var invitationSent = false;
    var invitationAccepted = false;
    final client = MockClient((request) async {
      final isOwner = request.headers['authorization'] == 'Bearer capture-owner';
      dynamic data = [];
      if (request.url.path == '/v1/guardians' && request.method == 'POST') {
        final body = jsonDecode(request.body) as Map;
        expect(body['email'], 'guardian@example.com');
        relationship = {'id': 'capture-invitation', 'name': body['name'], 'email': body['email'], 'status': 'pending', 'enabled': true};
        invitationSent = true;
        data = relationship;
      } else if (request.url.path.endsWith('/accept')) {
        expect(isOwner, false);
        relationship!['status'] = 'accepted';
        invitationAccepted = true;
        data = {};
      } else if (request.url.path == '/v1/guardians') {
        data = isOwner && relationship != null ? [relationship] : [];
      } else if (request.url.path == '/v1/guardian-invitations') {
        data = !isOwner && invitationSent && !invitationAccepted ? [{'id': 'capture-invitation', 'owner': {'email': 'family@example.com'}}] : [];
      }
      return http.Response(jsonEncode({'data': data}), 200, headers: {'content-type': 'application/json; charset=utf-8'});
    });
    final ownerApi = ApiClient(client: client, baseUrl: 'https://capture.invalid', sessionStore: owner);
    final guardianApi = ApiClient(client: client, baseUrl: 'https://capture.invalid', sessionStore: guardian);
    final ownerPush = PushNotificationService(messaging: CapturePushGateway(), api: ownerApi, sessions: owner, deviceId: () => 'capture-owner-device', configured: true);
    final guardianPush = PushNotificationService(messaging: CapturePushGateway(), api: guardianApi, sessions: guardian, deviceId: () => 'capture-guardian-device', configured: true);
    addTearDown(ownerPush.dispose);
    addTearDown(guardianPush.dispose);
    expect(await ownerPush.registerCurrentDevice(), true);
    expect(await guardianPush.registerCurrentDevice(), true);
    await capture.pumpPage(tester, theme, Pushalarm(apiClient: ownerApi, sessionStore: owner, notifications: ownerPush));
    await capture.capture(tester, 'guardian-base');
    capture.reportPoint(tester, 'guardian.open', find.text('보호자 초대'));
    await tester.tap(find.text('보호자 초대'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField).at(0), 'guardian@example.com');
    await tester.enterText(find.byType(TextFormField).at(1), '홍길동');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await capture.capture(tester, 'guardian-invite');
    capture.reportPoint(tester, 'guardian.dialog', find.byType(AlertDialog));
    capture.reportPoint(tester, 'guardian.invite', find.text('초대').last);
    await tester.tap(find.text('초대').last);
    await tester.pumpAndSettle();
    await capture.capture(tester, 'guardian-pending');
    expect(invitationSent, true);
    await capture.pumpPage(tester, theme, Pushalarm(apiClient: guardianApi, sessionStore: guardian, notifications: guardianPush));
    await tester.ensureVisible(find.text('수락'));
    await tester.pumpAndSettle();
    await capture.capture(tester, 'guardian-received');
    capture.reportPoint(tester, 'guardian.accept', find.text('수락'));
    await tester.tap(find.text('수락'));
    await tester.pumpAndSettle();
    expect(invitationAccepted, true);
    await capture.pumpPage(tester, theme, Pushalarm(apiClient: ownerApi, sessionStore: owner, notifications: ownerPush));
    expect(find.text('연결됨 · 알림 켜짐'), findsOneWidget);
    await capture.capture(tester, 'guardian-linked');
    final inkWarning = tester.takeException();
    if (inkWarning != null) expect(inkWarning.toString(), contains('ListTile background color or ink splashes may be invisible'));

    final pharmacyData = jsonDecode((await tester.runAsync(() => File('/Users/kimrasng/dev/pillnoteweb/design/capture/seoul-station-pharmacies.json').readAsString()))!);
    final pharmacyApi = ApiClient(baseUrl: 'https://capture.invalid', client: MockClient((request) async {
      expect(request.url.path, '/v1/pharmacies/search');
      expect(double.parse(request.url.queryParameters['lat']!), closeTo(37.5547, .0001));
      return http.Response(jsonEncode(pharmacyData), 200, headers: {'content-type': 'application/json; charset=utf-8'});
    }));
    await tester.runAsync(() => HttpOverrides.runZoned(() async {
      final cache = BuiltInMapCachingProvider.getOrCreateInstance(cacheDirectory: '/private/tmp/pillnote-website-capture-map', maxCacheSize: 20000000);
      await capture.pumpPage(tester, theme, Distanc(apiClient: pharmacyApi));
      await Future<void>.delayed(const Duration(seconds: 6));
      for (var frame = 0; frame < 12; frame++) {
        await tester.pump(const Duration(milliseconds: 100));
        await Future<void>.delayed(const Duration(milliseconds: 100));
      }
      await tester.tap(find.text('이 지역 약국 찾기'));
      await tester.pumpAndSettle();
      await capture.saveBoundary(tester, 'pharmacy-station');
      tester.widget<CustomScrollView>(find.byType(CustomScrollView).first).controller!.jumpTo(315);
      await tester.pumpAndSettle();
      await capture.saveBoundary(tester, 'pharmacy-list');

      capture.reportPoint(tester, 'pharmacy.select', find.text('센츄럴팜약국').last);
      await tester.tap(find.text('센츄럴팜약국').last);
      await tester.pumpAndSettle();
      expect(find.text('02-393-5505'), findsOneWidget);
      await capture.saveBoundary(tester, 'pharmacy-detail');
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pumpAndSettle();
      await cache.destroy();
    }, createHttpClient: capture.CaptureHttpOverrides().createHttpClient));
    debugDefaultTargetPlatformOverride = null;
    expect(tester.takeException(), isNull);
  });
}

class CapturePushGateway implements PushMessagingGateway {
  @override bool get isIos => false;
  @override String? get platform => 'android';
  @override Future<void> initialize() async {}
  @override Stream<String> get tokenRefresh => const Stream.empty();
  @override Stream<RemoteMessage> get messages => const Stream.empty();
  @override Future<AuthorizationStatus> permission({bool request = false}) async => AuthorizationStatus.authorized;
  @override Future<String?> token() async => 'isolated-capture-token';
  @override Future<String?> apnsToken() async => null;
}
