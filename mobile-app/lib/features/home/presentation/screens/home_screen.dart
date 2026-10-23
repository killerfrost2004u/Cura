import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Cura'), actions: [
      IconButton(tooltip: 'Sign out', onPressed: () => context.read<AuthCubit>().logout(), icon: const Icon(Icons.logout)),
    ]),
    body: ListView(padding: const EdgeInsets.all(24), children: [
      Text('Your day, made easier', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 8),
      const Text('Starter dashboard. Connect each mode to its feature screens and backend.', style: TextStyle(color: AppColors.muted)),
      const SizedBox(height: 24),
      const _ModeCard(icon: Icons.auto_awesome, title: 'Normal mode', subtitle: 'AI assistant and app controls', color: AppColors.secondary),
      const _ModeCard(icon: Icons.favorite_outline, title: 'Alzheimer’s support', subtitle: 'Daily routines, memories and trusted contacts', color: Color(0xFFF39A63)),
      const _ModeCard(icon: Icons.center_focus_strong, title: 'ADHD support', subtitle: 'Focus sessions, tasks and mood check-ins', color: AppColors.success),
      const _ModeCard(icon: Icons.people_outline, title: 'Caregiver dashboard', subtitle: 'Consent-based routine overview', color: AppColors.primary),
    ]),
  );
}
class _ModeCard extends StatelessWidget {
  const _ModeCard({required this.icon, required this.title, required this.subtitle, required this.color});
  final IconData icon; final String title; final String subtitle; final Color color;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 14),
    child: ListTile(
      leading: CircleAvatar(backgroundColor: color.withValues(alpha: 0.14), child: Icon(icon, color: color)),
      title: Text(title), subtitle: Text(subtitle), trailing: const Icon(Icons.chevron_right),
      onTap: () => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$title is a planned feature.'))),
    ),
  );
}
