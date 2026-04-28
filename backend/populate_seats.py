import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from theatres.models import Screen, Seat

def populate_seats():
    # Target all screens or a specific one
    screens = Screen.objects.all()
    
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']
    seats_per_row = 20
    
    for screen in screens:
        print(f"Populating seats for {screen}...")
        
        # Clear existing seats for a clean start if needed
        # Seat.objects.filter(screen=screen).delete()
        
        seats_to_create = []
        for row in rows:
            for i in range(1, seats_per_row + 1):
                seat_num = f"{row}{i}"
                
                # Check if seat already exists to avoid UniqueConstraint error
                if not Seat.objects.filter(screen=screen, seat_number=seat_num).exists():
                    # Make last 2 rows VIP
                    seat_type = 'VIP' if row in ['Q', 'R'] else 'NORMAL'
                    
                    seats_to_create.append(Seat(
                        screen=screen,
                        seat_number=seat_num,
                        seat_type=seat_type
                    ))
        
        if seats_to_create:
            Seat.objects.bulk_create(seats_to_create)
            print(f"Successfully created {len(seats_to_create)} seats for {screen}.")
        else:
            print(f"No new seats created for {screen} (already populated).")

if __name__ == "__main__":
    populate_seats()
