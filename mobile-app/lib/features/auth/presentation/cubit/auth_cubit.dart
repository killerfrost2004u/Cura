import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_current_user.dart';
import '../../domain/usecases/login.dart';
import '../../domain/usecases/logout.dart';
import '../../domain/usecases/register.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  AuthCubit({required Login login, required Register register, required Logout logout, required GetCurrentUser getCurrentUser})
      : _login = login, _register = register, _logout = logout, _getCurrentUser = getCurrentUser, super(const AuthState());
  final Login _login;
  final Register _register;
  final Logout _logout;
  final GetCurrentUser _getCurrentUser;

  Future<void> checkSession() async {
    try {
      final user = await _getCurrentUser();
      emit(user == null ? const AuthState(status: AuthStatus.unauthenticated) : AuthState(status: AuthStatus.authenticated, user: user));
    } catch (_) {
      emit(const AuthState(status: AuthStatus.unauthenticated));
    }
  }

  Future<void> login({required String email, required String password}) async {
    emit(const AuthState(status: AuthStatus.loading));
    try {
      emit(AuthState(status: AuthStatus.authenticated, user: await _login(email: email, password: password)));
    } catch (error) {
      emit(AuthState(status: AuthStatus.failure, errorMessage: _message(error)));
    }
  }

  Future<void> register({required String name, required String email, required String password}) async {
    emit(const AuthState(status: AuthStatus.loading));
    try {
      emit(AuthState(status: AuthStatus.authenticated, user: await _register(name: name, email: email, password: password)));
    } catch (error) {
      emit(AuthState(status: AuthStatus.failure, errorMessage: _message(error)));
    }
  }

  Future<void> logout() async {
    emit(const AuthState(status: AuthStatus.loading));
    try {
      await _logout();
      emit(const AuthState(status: AuthStatus.unauthenticated));
    } catch (error) {
      emit(AuthState(status: AuthStatus.failure, errorMessage: _message(error)));
    }
  }

  String _message(Object error) => error is ArgumentError
      ? error.message?.toString() ?? 'Invalid input.'
      : 'Something went wrong. Please try again.';
}
