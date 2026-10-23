import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../auth/presentation/cubit/auth_state.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}
class _SplashScreenState extends State<SplashScreen> {
  bool _navigated = false;
  @override
  Widget build(BuildContext context) => BlocListener<AuthCubit, AuthState>(
    listener: (context, state) {
      if (_navigated || state.status == AuthStatus.initial || state.status == AuthStatus.loading) return;
      _navigated = true;
      context.go(state.status == AuthStatus.authenticated ? RouteNames.home : RouteNames.login);
    },
    child: const Scaffold(body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.blur_circular, size: 84),
      SizedBox(height: 12),
      Text('Cura', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
      SizedBox(height: 8),
      Text('Adaptive Interface System'),
      SizedBox(height: 28),
      CircularProgressIndicator(),
    ]))),
  );
}
