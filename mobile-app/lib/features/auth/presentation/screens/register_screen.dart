import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/router/route_names.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}
class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  @override
  void dispose() { _name.dispose(); _email.dispose(); _password.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Create account')),
    body: SafeArea(child: SingleChildScrollView(padding: const EdgeInsets.all(24),
      child: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state.status == AuthStatus.authenticated) context.go(RouteNames.home);
          if (state.status == AuthStatus.failure) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.errorMessage ?? 'Registration failed.')));
          }
        },
        builder: (context, state) => Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          AppTextField(controller: _name, label: 'Full name'),
          const SizedBox(height: 16),
          AppTextField(controller: _email, label: 'Email address', keyboardType: TextInputType.emailAddress),
          const SizedBox(height: 16),
          AppTextField(controller: _password, label: 'Password (8 characters minimum)', obscureText: true),
          const SizedBox(height: 24),
          AppButton(label: 'Create account', isLoading: state.status == AuthStatus.loading,
            onPressed: () => context.read<AuthCubit>().register(name: _name.text, email: _email.text, password: _password.text)),
        ]),
      ),
    )),
  );
}
