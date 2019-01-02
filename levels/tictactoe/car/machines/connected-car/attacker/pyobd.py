import serial
import time
from sys import argv

ser = serial.Serial(
	port = '/dev/serial0',
	parity = serial.PARITY_NONE,
	stopbits = serial.STOPBITS_ONE,
	baudrate = 115200,
	bytesize = serial.EIGHTBITS,
	timeout = 0
)

def main():
	args = ""
	if len(argv) >= 2:
		args = argv[1]
	if args == "":
		args = '--help'

	if args == '--help':
		print("")
		print("Command utility to read/write to OBD-II port")
		print("")
		print("Usage: python -m pyobd <command>")
		print("Commands:")
		print("  read            read current car data")
		print("  write_unlock    unlocks the doors")
		print("  write_turn_off  turns off the car")
		print("  ...             ...")
		print("")
	elif args == 'write_unlock':
		remote_unlock()
	elif args == 'write_turn_off':
		remote_off()
	elif args == 'read':
		get_car_status()
	else:
		print("Invalid command.")
	
def remote_off():
	print("Turning off car")
	ser.write("turnoff\n".encode())
	for i in range (3):
		print(".")
		time.sleep(1)
	print("Done!")
	
def remote_unlock():
	print("Unlocking car doors")
	ser.write("unlock\n".encode())
	for i in range (3):
		print(".")
		time.sleep(1)
	print("Done!")

def get_car_status():
	time.sleep(2)
	for i in range (6):
		recv = ser.readline(50)
		#time.sleep(.1)
		print(recv.decode())
		time.sleep(.2)

main()