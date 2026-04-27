from django.contrib import admin
from .models import Theatre, Screen, Seat

@admin.register(Theatre)
class TheatreAdmin(admin.ModelAdmin):
    list_display = ('name', 'city')
    search_fields = ('name', 'city')

admin.site.register(Screen)
admin.site.register(Seat)
