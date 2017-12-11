import numpy as np
import cv2

#cap = cv2.VideoCapture('./videos/Hong Kong - 1920x1080.mp4') # Pas super fluide
cap = cv2.VideoCapture('./videos/Piano - 1280x720.mp4')
#cap = cv2.VideoCapture('./videos/Animals - 960x540.mp4')
#cap = cv2.VideoCapture('./videos/Ants - 640x360.mp4') 		  # Bien, mais comment mettre en plein ecran.

while(cap.isOpened()):
    ret, frame = cap.read()

    #gray = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV) # cv2.COLOR_BGR2GRAY)
    #cv2.imshow('frame',gray)
    cv2.imshow('frame',frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()