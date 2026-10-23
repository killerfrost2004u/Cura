import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/user_model.dart';

abstract interface class AuthRemoteDataSource {
  Future<UserModel> login({required String email, required String password});
  Future<UserModel> register({required String name, required String email, required String password});
  Future<UserModel?> getCurrentUser();
  Future<void> logout();
}

/// Demo stub. Replace with real Dio endpoints before release.
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  AuthRemoteDataSourceImpl(this._client, this._storage);
  final DioClient _client;
  final SecureStorageService _storage;

  @override
  Future<UserModel> login({required String email, required String password}) async {
    // Example: final response = await _client.dio.post(ApiConstants.login, data: {...});
    // Save the access token returned by your backend; never store a password.
    await Future<void>.delayed(const Duration(milliseconds: 250));
    if (email.trim().isEmpty || password.isEmpty) throw ArgumentError('Email and password are required.');
    return UserModel(id: 'demo-user', name: 'Cura Demo User', email: email.trim());
  }

  @override
  Future<UserModel> register({required String name, required String email, required String password}) async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    if (name.trim().isEmpty || email.trim().isEmpty || password.length < 8) {
      throw ArgumentError('Provide a name, email and password of at least 8 characters.');
    }
    return UserModel(id: 'demo-user', name: name.trim(), email: email.trim());
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    final token = await _storage.readAccessToken();
    if (token == null || token.isEmpty) return null;
    // Implement GET /auth/me and parse its response here.
    return null;
  }

  @override
  Future<void> logout() => _storage.deleteTokens();
}
