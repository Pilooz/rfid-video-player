#-----------------------------------------------------------------------------
# media : Seeking media database, and storing result in a structure
#             Returns false if no media found
#-----------------------------------------------------------------------------
class media:
	"""Media class dealing with tags and associated medias"""
	def __init__(self, tag, db): # constructor
  		self.tag = tag
  		self.media = ""
  		self.db = db

	def select(self):
		with self.db:
			
		return True

	def play():
		return True