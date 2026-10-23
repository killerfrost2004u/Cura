import 'package:equatable/equatable.dart';
import '../../domain/entities/user_entity.dart';
enum AuthStatus { initial, loading, authenticated, unauthenticated, failure }
class AuthState extends Equatable {
  const AuthState({this.status = AuthStatus.initial, this.user, this.errorMessage});
  final AuthStatus status;
  final UserEntity? user;
  final String? errorMessage;
  @override
  List<Object?> get props => [status, user, errorMessage];
}
