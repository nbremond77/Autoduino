# Autoduino

Arduino UNO shield to interface the I/O modules of A4 Technology // Autoduino est un bouclier pour Arduino Uno qui permet de piloter les maquettes A4 Technology utilisées pour l'enseignement de la technologie.

# Introduction
Le bouclier Autoduino permet de piloter les maquettes A4 technology grâce à un Arduino UNO. Pour cela, le bouclier est équipé de 
- 16 connecteurs Jack 2.5mm permettant la connection des capteurs et actionneurs de la maquette,
- 2 connecteurs jack 2.5mm pour deux moteurs DC,
- 2 LED RGB adressables (type WS2812B),
- 1 encodeur/push,
- quelques connecteurs supplémentaires permettant de connecter des capteurs/actionneurs plus évolués (I2C, SPI, Serial...) ou un écran LCD (non testé).
Pour supporter le grand nombre d'entrées/sorties, il a été nécessaire d'utiliser un GPIO Expander (PCA9555). Celà implique l'utilisation d'une bibliothèque logiciel adaptée.
La programmation de l'Arduino peut se faire grâce à blockly@rDuino: http://technologiescollege.github.io/ qui inclus maintenant la bibliothèque adéquate.

# Note importante
Une nouvelle version de cet Autoduino est en préparation. La carte électronique sera plus simple, et surtout, elle sera adaptée à un Arduino Due qui dispose de beaucoup plus d'entrées/sortie. Cela permettra d'éviter l'utilisation du GPIO Explander (PCA9555), ce qui simplifie grandement le logiciel.
De plus, l'Arduino Due fonctionne en 3.3V, ce qui simplifie l'utilisation de périphériques récents (Ecran tactile LCD...).
Enfin, c'est un processeur 32 bits beaucoup plus performant que celui de l'Arduino uNO;

De plus, j'ai prévu quelques amélioration:
- Ajout de connecteurs Grove en plus des connecteurs jack 2.5?
- Possibilité de connecter le module Bluetooth sur un RX/TX différent de celui connecté à l'USB
- Ajouter une interface permettant de connecter un écran tactile LCD de 2.8 pouces.
