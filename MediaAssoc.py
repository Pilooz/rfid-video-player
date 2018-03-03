#-----------------------------------------------------------------------------
# media : Seeking media database, and storing result in a structure
#             Returns false if no media found
#-----------------------------------------------------------------------------
import os
import os.path
import random
from subprocess import Popen

class MediaAssoc:
	""" Media class dealing with tags and associated medias """
	def __init__(self, mediaList, keywordList, mediaPath, logger): # constructor
  		self.file = ""		
  		self.mediaList = mediaList
  		self.keywordList = keywordList
  		self.mediaPath = mediaPath
  		self.wait = False 
  		self.lastTag = None
  		self.playing = False
  		self.logger = logger

  	def _removeDupplicates(self,a):
  		""" remove dupplicates elements of en list """
  		b = set(a)
		result = list(b)
		return result

	def _tagExists(self, tag):
		""" returns a element of mediaList if exists, otherwise None """
		keywordsSelected = []
		for elt in self.keywordList["keywordslist"]:
			for t in elt["codes"]:
				if (t == tag):
					keywordsSelected.append(elt["keyword"])
					self.lastTag = tag
		keywordsSelected = self._removeDupplicates(keywordsSelected)
		self.logger.info("Keywords found : {}".format(keywordsSelected))
		return keywordsSelected

	def needWaiting(self, tag):
		# """ Returns True is we need to wait for a second RFID reading """
		# elt = self._tagExists(tag)
		# if (elt != None):
		# 	if (len(elt["tag"]) > 1):
		# 		self.wait = True
		# 		return True
		# 	return False 
		return False 	

	def getFile(self, tag):
		""" Method to select a media in database from a read rfid tag """
		mediaSelected = []
		keys = self._tagExists(tag)
		# Selecting files
		for elt in self.mediaList["medialist"]:
			for t in elt["keywords"]:
				if t in keys:
					mediaSelected.append(elt["media"])

		if (len(mediaSelected) > 0):
			mediaSelected = self._removeDupplicates(mediaSelected)
			self.logger.info("Videos found '{}'".format(mediaSelected))
			self.file = random.choice(mediaSelected)
			self.logger.info("Decide to play : {}".format(self.file))
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
			self.logger.warn("This media was not found !")
			self.displayMessage("mediaNotFound", False)

	def stop(self):
		""" stops all omxplayer instances """
		self.logger.info("Stopping all instance of omxplayer !")
		os.system("killall omxplayer.bin")
		self.wait = False
		self.playing = False

	def isPlaying(self):
		""" getter. Let us know if a video is playing now """
		return self.playing

	def displayMessage(self, name, loop):
		""" display an error in video mode ! """
		loopOpt = ""
		if loop:
			loopOpt = " --loop"
			print "Looping video..."
		omxc = Popen(['omxplayer', '-b' + loopOpt, self.mediaPath +"/messages/" + name + ".mp4" ])
		self.wait = False
		self.playing = True

	#def displayWaitingState(self):
	#	thread.start_new_thread(os.system("omxplayer -b -loop " + self.mediaPath +"/messages/waitingForTag.mp4"), ("") )

