#-----------------------------------------------------------------------------
# media : Seeking media database, and storing result in a structure
#             Returns false if no media found
#-----------------------------------------------------------------------------
"""
  Note : 
  On a besoin d'une classe "mediaAssoc"
   - qui comporte la BDD
   - les methodes de recherche
   - les attributs
      - DB
      - Wait  (True lorsque qu'on doit attendre une autre lecture avant de jouer un media)
      - media (renseigne lorsque que le media associe a ete trouve.)

"""
import os

class MediaAssoc:
	""" Media class dealing with tags and associated medias """
	def __init__(self, db): # constructor
  		self.file = ""		
  		self.db = db
  		self.wait = False 
  		self.lastTag = None
  		self.playing = False 

	def tagExists(self, tag):
		""" returns a element of db if exists, otherwise None """
		for elt in self.db["tags"]:
			for t in elt["tag"]:
				if (t == tag):
					self.lastTag = tag
					return elt
		return None

	def needWaiting(self, tag):
		""" Returns True is we need to wait for a second RFID reading """
		elt = self.tagExists(tag)
		if (elt != None):
			if (len(elt["tag"]) > 1):
				return True
			return False 
		return False 	

	def getFile(self, tag):
		""" Method to select a media in database from a read rfid tag """
		elt = self.tagExists(tag)
		if (elt != None):
			print ("Found video '{}'".format(elt["media"]))
			self.file = elt["media"]
			return self.file
		return None

	def play(self, file):
		self.playing = True
		os.system("omxplayer -b './" + file + "'")

	def stop(self):
		self.playing = False
		os.system("killall omxplayer")

	def isPlaying(self):
		return self.playing
	
	#def play(self, file):
  #  return True


"""
    vidFile = cv.CaptureFromFile( "/home/pi/projets/rfid-video-player/{}".format(file)

    nFrames = int(  cv.GetCaptureProperty( vidFile, cv.CV_CAP_PROP_FRAME_COUNT ) )
    fps = cv.GetCaptureProperty( vidFile, cv.CV_CAP_PROP_FPS )
    waitPerFrameInMillisec = int( 1/fps * 1000/1 )
    print 'Num. Frames = ', nFrames
    print 'Frame Rate = ', fps, ' frames per sec'

    for f in xrange( nFrames ):
      frameImg = cv.QueryFrame( vidFile )
      cv.ShowImage( "My Video Window",  frameImg )
      cv.WaitKey( waitPerFrameInMillisec  )

    # When playing is done, delete the window
    #  NOTE: this step is not strictly necessary, 
    #         when the script terminates it will close all windows it owns anyways
    cv.DestroyWindow( "My Video Window" )
"""

