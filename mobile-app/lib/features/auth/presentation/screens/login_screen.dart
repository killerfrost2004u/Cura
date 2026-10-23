import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  @override
  void dispose() { _email.dispose(); _password.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(child: Center(child: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 420),
        child: BlocConsumer<AuthCubit, AuthState>(
          listener: (context, state) {
            if (state.status == AuthStatus.authenticated) context.go(RouteNames.home);
            if (state.status == AuthStatus.failure) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.errorMessage ?? 'Login failed.')));
            }
          },
          builder: (context, state) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const Icon(Icons.blur_circular, size: 72, color: AppColors.primary),
            const SizedBox(height: 16),
            Text('Cura', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineLarge),
            const SizedBox(height: 8),
            const Text('Care that adapts to you.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 40),
            AppTextField(controller: _email, label: 'Email address', keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),
            AppTextField(controller: _password, label: 'Password', obscureText: true),
            const SizedBox(height: 24),
            AppButton(label: 'Sign in', isLoading: state.status == AuthStatus.loading,
              onPressed: () => context.read<AuthCubit>().login(email: _email.text, password: _password.text)),
            TextButton(onPressed: () => context.push(RouteNames.register), child: const Text('Create account')),
          ]),
        ),
      ),
    ))),
  );
}
