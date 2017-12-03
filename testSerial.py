#!/usr/bin/python

import serial, time


#initialization and open the port

#possible timeout values:
#    1. None: wait forever, block call
#    2. 0: non-blocking mode, return immediately
#    3. x, x is bigger than 0, float allowed, timeout block call

ser = serial.Serial()
ser.port = "/dev/ttyUSB0"
ser.baudrate = 115200

try: 
  ser.open()
except Exception, e:
  print "error open serial port: " + str(e)
  exit()

if ser.isOpen():

  try:
      ser.flushInput() #flush input buffer, discarding all its contents
      ser.flushOutput()#flush output buffer, aborting current output 

      print("Serial intialized : {}, at {} bds." .format(ser.port, ser.baudrate))
      print("Waiting for tags...")
      
      while True:
        try:
          response = ser.readline()
          print("read data: " + response)
        
        except KeyboardInterrupt:
          ser.close()
          break

      ser.close()
  except Exception, e1:
    print "error communicating...: " + str(e1)

else:
  print "cannot open serial port "

