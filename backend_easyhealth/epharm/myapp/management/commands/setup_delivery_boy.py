from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from myapp.models import Order, CustomUser

class Command(BaseCommand):
    help = 'Set up Delivery Boy group and create a test delivery boy user'

    def handle(self, *args, **options):
        # Create Delivery Boy group if it doesn't exist
        group, created = Group.objects.get_or_create(name='Delivery Boy')
        if created:
            # Add permissions to view and change orders
            order_content_type = ContentType.objects.get_for_model(Order)
            view_order_permission = Permission.objects.get(content_type=order_content_type, codename='view_order')
            change_order_permission = Permission.objects.get(content_type=order_content_type, codename='change_order')
            group.permissions.add(view_order_permission, change_order_permission)
            self.stdout.write(self.style.SUCCESS('Created "Delivery Boy" group with order view and change permissions'))
        else:
            self.stdout.write('Delivery Boy group already exists')

        # Create a test delivery boy user
        username = 'delivery_boy'
        if not CustomUser.objects.filter(username=username).exists():
            user = CustomUser.objects.create_user(
                username=username,
                email='delivery@medinest.com',
                password='delivery123',
                first_name='Delivery',
                last_name='Boy',
                is_staff=True
            )
            user.groups.add(group)
            self.stdout.write(self.style.SUCCESS(f'Created test delivery boy user: {username} (password: delivery123)'))
        else:
            self.stdout.write('Test delivery boy user already exists')

        self.stdout.write(self.style.SUCCESS('Delivery Boy setup complete!'))
