from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
        ('products', '0004_remove_productimage_product_alter_product_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='category',
            field=models.ForeignKey(
                to='categories.category',
                on_delete=django.db.models.deletion.SET_NULL,
                null=True,
                blank=True,
                related_name='products'
            ),
        ),
    ]