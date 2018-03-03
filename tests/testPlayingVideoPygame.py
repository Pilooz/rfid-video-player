# http://www.fileformat.info/format/mpeg/sample/index.dir
#
# sudo apt-get install python-pygame
#
import pygame

FPS = 60

pygame.init()
clock = pygame.time.Clock()

#movie = pygame.movie.Movie('./videos/Hong Kong - 1920x1080.mp4')
#movie = pygame.movie.Movie('./videos/Piano - 1280x720.mp4')
#movie = pygame.movie.Movie('./videos/Animals - 960x540.mp4')
movie = pygame.movie.Movie('./videos/Ants - 640x360.mp4')

screen = pygame.display.set_mode(movie.get_size())
movie_screen = pygame.Surface(movie.get_size()).convert()

movie.set_display(movie_screen)
movie.play()


playing = True
while playing:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            movie.stop()
            playing = False

    screen.blit(movie_screen,(0,0))
    pygame.display.update()
    clock.tick(FPS)

pygame.quit()