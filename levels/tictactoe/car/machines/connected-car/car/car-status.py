import serial
import time
import random

ser = serial.Serial(
port = '/dev/serial0',
parity = serial.PARITY_NONE,
stopbits = serial.STOPBITS_ONE,
baudrate = 115200,
bytesize = serial.EIGHTBITS,
timeout = 0)

while True:

    random_speed = random.randint(10,85)
    random_accel = random.randint(10,85)
    random_brake = random.randint(0, 10)
    random_gear = random.randint(1,6)
    random_x_coord = random.uniform(85, -180)
    random_y_coord = random.uniform(-85, 180)
    
    car_values = "Speed: " + str(random_speed) + " \nAcceleration: " + str(random_accel)+ " \nBrake Pressure: " + str(random_brake) + " \nGear: " + str(random_gear)+ " \nCoordinates: " + str(random_x_coord) + " , " + str(random_y_coord) 

    ser.write(car_values.encode())
    print(car_values)
    time.sleep(2)