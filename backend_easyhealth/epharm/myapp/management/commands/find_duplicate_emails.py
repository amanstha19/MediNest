from django.core.management.base import BaseCommand
from django.db.models import Count
from myapp.models import CustomUser


class Command(BaseCommand):
    help = 'Find and display users with duplicate email addresses'

    def handle(self, *args, **options):
        # Find emails that appear more than once
        duplicate_emails = (
            CustomUser.objects
            .values('email')
            .annotate(email_count=Count('id'))
            .filter(email_count__gt=1)
        )

        if not duplicate_emails:
            self.stdout.write(
                self.style.SUCCESS('✅ No duplicate emails found! All users have unique email addresses.')
            )
            return

        self.stdout.write(
            self.style.WARNING(f'⚠️  Found {len(duplicate_emails)} email(s) with duplicate users:\n')
        )

        for dup in duplicate_emails:
            email = dup['email']
            count = dup['email_count']
            
            self.stdout.write(
                self.style.ERROR(f'Email: {email} ({count} users)')
            )
            
            # Get all users with this email
            users = CustomUser.objects.filter(email=email).order_by('id')
            
            for user in users:
                self.stdout.write(
                    f'  - ID: {user.id}, Username: {user.username}, '
                    f'Name: {user.first_name} {user.last_name}, '
                    f'Created: {user.date_joined}'
                )
            
            self.stdout.write('')  # Empty line for readability

        self.stdout.write(
            self.style.WARNING(
                '\n⚠️  IMPORTANT: You need to resolve these duplicates before applying the email uniqueness migration.\n'
                'Options:\n'
                '1. Delete duplicate users (if they are test accounts)\n'
                '2. Change email addresses for duplicate users\n'
                '3. Merge user data and delete duplicates\n'
            )
        )
