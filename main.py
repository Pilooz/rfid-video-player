#!/usr/bin/env python

import serial, time, json
from MediaAssoc import MediaAssoc
import logging
import pyautogui
from logging.handlers import RotatingFileHandler

# Logging in a file : ./log/rfid-video-player.log
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] : %(message)s')
file_handler = RotatingFileHandler('./log/rfid-video-player.log', 'a', 1000000, 1)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
# second handler qui va rediriger chaque ecriture de log sur la console
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
logger.addHandler(stream_handler)

# Loading media database
mediaList = json.load(open('data/media.json'))
keywords = json.load(open('data/keywords.json'))

# Init of the mediaAssoc Class
media = MediaAssoc(mediaList, keywords, "./videos", logger)

# initialization and open the serial port
ser = serial.Serial()
ser.port =  "/dev/ttyACM0" # "/dev/ttyACM0" #"/dev/ttyAMA0" #"/dev/ttyS0"
ser.baudrate = 115200

# To know on which reader was read the last tag
lastReader = ""

#moving mouse bottom right
pyautogui.onScreen(1024, 720)

#-----------------------------------------------------------------------------
# Extract_tag : Verifying tag format, and extracting value
#               <TAG:xxxxxxxxxx>
#-----------------------------------------------------------------------------
def extract_tag(line):
  patterns = ["<TAG:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) == 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return None

#-----------------------------------------------------------------------------
# extract_reader : Verifying reader format, and extracting value
#               <READER:xx>
#-----------------------------------------------------------------------------
def extract_reader(line):
  patterns = ["<READER:", ">"]
  # See if enclosure is correct and return tag
  if (line.find(patterns[0]) > 0 and line.find(patterns[1]) > -1):
    return line.split(patterns[0], 1)[1].split(patterns[1])[0]
  return None

#-----------------------------------------------------------------------------
# Displaying some JSON string in console to help in configuring 
# media <-> tag association
#-----------------------------------------------------------------------------
def displaysCodeInConsole(tag):
  logger.warn("\n \
    \n========================================================== \
    \nThis tag is not associated with a video... \
    \nPlease edit data/videolist.json and add an association :  \
    \n \
    \n { \
    \n   \"tag\": [\"" + tag + "\"] \
    \n     \"media\": \"videos/myNewVideo.mp4\" \
    \n }, \
    \n ==========================================================\n")


##############################################################################
#   M A I N 
##############################################################################
try: 
  ser.open()
except Exception, e:
  logger.info("error open serial port: " + str(e))
  exit()

if ser.isOpen():

  try:
      ser.flushInput() #flush input buffer, discarding all its contents
      ser.flushOutput()#flush output buffer, aborting current output 

      logger.info("Serial intialized : {}, at {} bds." .format(ser.port, ser.baudrate))
      logger.info("Waiting for tags..." )
      media.play("./videos/messages/noir.jpg")
      media.displayMessage("waitingForTag", True)
      
      while True:
        try:
          response = ""
          tag = ""
          reader = ""
          okForPlayingMedia = False 

          # Waiting for Serial inputs (some tags!)
          response = ser.readline()
          print(response)

          # Analysing message
          tag = extract_tag(response)
          reader = extract_reader(response)
          logger.info("Tag {} on reader #{}" . format(tag, reader))

          # 1. if tag is not NONE, seek media database to see if a meddia is associated
          if (tag != None):
            # See if we have to stop precendent media.
            if(media.isPlaying()):
              logger.info("A video is allready playing, cleaning up..." )
              media.stop()

            # Complex scenario that needs 2 tags
            if (media.needWaiting(tag)):
              # Second Tag on second reader
              if(lastReader != reader and lastReader != ""):
                # Ok for this combination of two tags : play media
                lastReader = ""
                okForPlayingMedia = True
              else:  
                logger.info("Tag combination ! Waiting for another tag...")
                lastReader = reader

            else:
              okForPlayingMedia = True

            # Playing media now
            if (okForPlayingMedia):
              mediaFile = media.getFile(tag)
              if ( mediaFile != None ):
                # 1.1. Media Found
                logger.info("Playing '{}'...".format(mediaFile))
                media.play(mediaFile)
              else:
                # 1.2. Media not found
                media.displayMessage("noTagAssociation", False)
                # Print error in console
                displaysCodeInConsole(tag)

          else:
            # Tag has not been sent correctly... Don't care...
            logger.info("Tag has not been sent correctly... Don't care...")

        except KeyboardInterrupt:
          ser.close()
          logger.info("\nBye bye... Get in touch !")
          break

      ser.close()
  except Exception, e1:
    logger.error("Fatal error : " + str(e1))

else:
  logger.critical("cannot open serial port ")

