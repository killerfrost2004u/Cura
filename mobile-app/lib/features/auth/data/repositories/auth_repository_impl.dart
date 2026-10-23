import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';
class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote);
  final AuthRemoteDataSource _remote;
  @override
  Future<UserEntity> login({required String email, required String password}) => _remote.login(email: email, password: password);
  @override
  Future<UserEntity> register({required String name, required String email, required String password}) => _remote.register(name: name, email: email, password: password);
  @override
  Future<UserEntity?> getCurrentUser() => _remote.getCurrentUser();
  @override
  Future<void> logout() => _remote.logout();
}
