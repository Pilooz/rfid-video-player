/******************************************************************************************
  Lecture de 2 modules RFID 125KHz sur 2 ports séries différents, et renvoie du tag lu sur
  le port Serie USB.

  Le microcontrolleur qui fonctionne pour ce sketch est le TEENSY 3.2 qui possède jusqu'à 6 liaaisons
  séries.

  Cablage des lecteurs RFID pour le teensy 3.2 :
  ----------------------------------------------
  Cablage du module RFID GROVE (SeedStudio) N°1 sur Serial1
  Rouge=>5V
  Noir=>GND
  Blanc=>1
  Jaune=>0

  Cablage du module RFID GROVE (SeedStudio) N°2 sur Serial2
  Rouge=>5V
  Noir=>GND
  Blanc=>9
  Jaune=>10

  Cablage des lecteurs RFID pour le Seeeduino 2560 ou Arduino Mega :
  ------------------------------------------------------------------
  Cablage du module RFID GROVE (SeedStudio) N°1 sur Serial1
  Rouge=>5V
  Noir=>GND
  Blanc=>RX1
  Jaune=>TX1

  Cablage du module RFID GROVE (SeedStudio) N°2 sur Serial2
  Rouge=>5V
  Noir=>GND
  Blanc=>RX2
  Jaune=>TX2

  Ajout d'un lecteur RFID (Pour le Teensy 3.2 et le Seeeduino 2560).
  ------------------------------------------------------------------
  Decommenter les lignes correspondantes à RFID3/ReceivedCode3, dans le setup et la loop
  ainsi que les fonctions read_rfid3 et decode_tag3.

  Pour plus de lecteurs, il faudra passer sur du SoftwareSerial
  (Sketch rfid-video-palyer-serial-emulated.ino)

******************************************************************************************/
// Start and end of rfid tag
#define START 0x02
#define END 0x03
#define RFID_SPEED 9600 //transmission speed with rfid reader
#define SERIAL_SPEED 115200 //transmission speed on Serial

#define VCC2 12
#define BUILD_LED 13
#define BLINK_INTERVAL 1000

#define RFID1 "1"
#define RFID2 "2"
#define RFID3 "3"

String ReceivedCode1 = "";
String ReceivedCode2 = "";
String ReceivedCode3 = "";

String readerName = "";

unsigned long previousMillis = 0;

/***************************************************
   Setup function
 ***************************************************/
void setup()
{
  // USB Serial
  Serial.begin(SERIAL_SPEED);
  delay(50);
  Serial.println("<MESSAGE:'Début du setup...'>");
  // rfid_reader_1
  Serial1.begin(RFID_SPEED);
  delay(50);
  Serial.println("<MESSAGE:'Lecteur #1 OK'>");
  //rfid_reader_2
  Serial2.begin(RFID_SPEED);
  delay(50);
  Serial.println("<MESSAGE:'Lecteur #2 OK'>");
  //rfid_reader_3
  Serial3.begin(RFID_SPEED);
  delay(50);
  Serial.println("<MESSAGE:'Lecteur #3 OK'>");
  // Flushing all serials now
  Serial.println("<MESSAGE:SETUP_OK>");
  // Switch on BUILD_LED
  pinMode(BUILD_LED, OUTPUT);
}

/***************************************************
   Loop function
 ***************************************************/
void loop()
{
  read_rfid1();
  read_rfid2();
  read_rfid3();
  blink_led();
}


/***************************************************
   Blinking led without blocking delay
 ***************************************************/
void blink_led() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= BLINK_INTERVAL) {
    previousMillis = currentMillis;
    digitalWrite(BUILD_LED, !digitalRead(BUILD_LED));
  }
}

/***************************************************
   reading first RFID reader
 ***************************************************/
void read_rfid1() {
  char c;
  if (Serial1.available())
  {
    readerName = RFID1;
    c = Serial1.read();
    decode_tag1(c);
  }
}

/***************************************************
   reading second RFID reader
 ***************************************************/
void read_rfid2() {
  char c;
  if (Serial2.available())
  {
    readerName = RFID2;
    c = Serial2.read();
    decode_tag2(c);
  }
}

/***************************************************
   reading Third RFID reader
 ***************************************************/
void read_rfid3() {
  char c;
  if (Serial3.available())
  {
    readerName = RFID3;
    c = Serial3.read();
    decode_tag3(c);
  }
}

/***************************************************
   decoding RFID1 tag
 ***************************************************/
void decode_tag1(char c) {
  static int Counter = 0;
  if (isprint(c)) ReceivedCode1 += c;
  if (c == START) Counter = 0;
  else Counter++;
  if (c == END)
  {
    sendSerial(ReceivedCode1);
    ReceivedCode1 = "";
  }
}

/***************************************************
   decoding RFID2 tag
 ***************************************************/
void decode_tag2(char c) {
  static int Counter = 0;
  if (isprint(c)) ReceivedCode2 += c;
  if (c == START) Counter = 0;
  else Counter++;
  if (c == END)
  {
    sendSerial(ReceivedCode2);
    ReceivedCode2 = "";
  }
}

/***************************************************
   decoding RFID3 tag
 ***************************************************/
void decode_tag3(char c) {
  static int Counter = 0;
  if (isprint(c)) ReceivedCode3 += c;
  if (c == START) Counter = 0;
  else Counter++;
  if (c == END)
  {
    sendSerial(ReceivedCode3);
    ReceivedCode3 = "";
  }
}

/***************************************************
  sending decoded tag on serial
***************************************************/
void sendSerial(String s) {
  Serial.print("<TAG:");
  Serial.print(s);
  Serial.print(">");
  Serial.print("<READER:");
  Serial.print(readerName);
  Serial.println(">");
}

