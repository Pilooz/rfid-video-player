import numpy as np
import cv2

#cap = cv2.VideoCapture('./videos/Hong Kong - 1920x1080.mp4') # Pas super fluide
#cap = cv2.VideoCapture('./videos/Piano - 1280x720.mp4')
#cap = cv2.VideoCapture('./videos/Animals - 960x540.mp4')
#cap = cv2.VideoCapture('./videos/Ants - 640x360.mp4') 		  # Bien, mais comment mettre en plein ecran.
cap = cv2.VideoCapture('./videos/man-of-constant-sorrow1.mp4')

# Set camera resolution. The max resolution is webcam dependent
# so change it to a resolution that is both supported by your camera
# and compatible with your monitor
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 800)

cv2.namedWindow('frame', cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty('frame', cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

while(cap.isOpened()):
    ret, frame = cap.read()
    cv2.imshow('frame',frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()