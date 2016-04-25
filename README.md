# Autoduino
Arduino UNO shield to interface the I/O modules of A4 Technology


Attention: C'est un travail encore non terminé: La carte fonctionne mais le logiciel Blockly@rduino est encore en cours de développement, et il est adapté à cette carte (pas très utile sans le shield car le nom des entrées sorties correspond à la carte et pas à l'arduino).

De plus, j'ai prévu quelques amélioration que j'espère pouvoir mener à bien l'été prochain si le budget le permet:
- Remplacer l'arduino Uno par un Mega, et supprimer le PCA9555 (IO expander) pour faciliter un accés directe aux E/S.
- Ajouter des connecteurs Grove en plus des connecteurs jack 2.5 (qui sont assez .... bof bof, et qui génèrent des court cuircuit à chaque manipulation)
- Connecter le module Bluetooth sur un RX/TX différent de celui connecté à l'USB
- Ajouter une liaison RS485 pour piloter des interfaces DMX
