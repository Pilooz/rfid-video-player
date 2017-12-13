#-----------------------------------------------------------------------------
# media : Seeking media database, and storing result in a structure
#             Returns false if no media found
#-----------------------------------------------------------------------------
import os
import os.path
from subprocess import Popen

class MediaAssoc:
	""" Media class dealing with tags and associated medias """
	def __init__(self, db, mediaPath): # constructor
  		self.file = ""		
  		self.db = db
  		self.mediaPath = mediaPath
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
				self.wait = True
				return True
			return False 
		return False 	

	def getFile(self, tag):
		""" Method to select a media in database from a read rfid tag """
		elt = self.tagExists(tag)
		if (elt != None):
			print ("Found video '{}'".format(elt["media"]))
			self.file = elt["media"]
			return self.mediaPath + "/" + self.file
		return None

	def play(self, file):
		"""  plays video """
		self.wait = False 
		self.playing = True
		if os.path.isfile(file):
			# exists
			omxc = Popen(['omxplayer', '-b', "./" + file ])
		else:
			self.displayError("mediaNotFound")

	def stop(self):
		""" stops all omxplayer instances """
		os.system("killall omxplayer.bin")
		self.wait = False
		self.playing = False

	def isPlaying(self):
		""" getter. Let us know if a video is playing now """
		return self.playing

	def displayError(self, name):
		""" display an error in video mode ! """
		omxc = Popen(['omxplayer', '-b', "./videos/" + name + ".mp4" ])
		self.wait = False
		self.playing = True

