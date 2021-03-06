/******************************************************************************************
  Lecture de 2 modules RFID de facon non concurrentielle 
  => auto exclusion à la lecture des tags
  2 liasons séries émulées, pour le plateformes arduino UNO, NANO, etc... 
  qui ne possedent pas plusieurs Serial Hardware
  
  Cablage du module RFID GROVE (SeedStudio) N°1
  Rouge=>5V
  Noir=>GND
  Blanc=>3
  Jaune=>2

  Cablage du module RFID GROVE (SeedStudio) N°2
  Rouge=>5V
  Noir=>GND
  Blanc=>5
  Jaune=>4

  Ajout d'un lecteur RFID (Pour le Teensy 3.2 et le Seeeduino 2560). 
  ------------------------------------------------------------------
  Decommenter les lignes correspondantes à 3eme lecteur

******************************************************************************************/

#include <SoftwareSerial.h>
// Strat and end of rfid tag
#define START 0x02
#define END 0x03
#define RFID_SPEED 9600 //transmission speed with rfid reader
#define SERIAL_SPEED 115200 //transmission speed on Serial
// TX & RX Pins
#define RX1 2
#define TX1 3
#define RX2 4
#define TX2 5
// Selon les I/O disponibles
// #define RX3 6
// #define TX3 7

SoftwareSerial rfid_reader_1(RX1, TX1);
SoftwareSerial rfid_reader_2(RX2, TX2);
// SoftwareSerial rfid_reader_3(RX3, TX3);

String ReceivedCode = "";

// Assume nn concurrentialy reading. On after the other
boolean currently_reading_1 = false;
boolean currently_reading_2 = false;
// boolean currently_reading_3 = false;

/***************************************************
   Setup function
 ***************************************************/
void setup()
{
  rfid_reader_1.begin(RFID_SPEED);
  rfid_reader_2.begin(RFID_SPEED);
  // rfid_reader_3.begin(RFID_SPEED);
  Serial.begin(SERIAL_SPEED);
  // Flushing all serials now
}

/***************************************************
   Loop function
   Lecture non concurrentielle des lecteurs jusqu'à 3
   Pour plus delecteurs il faut revoir la logique
     Il faut positionner un flag unique et global qui
     empêche toute autre lecteur temps que 
     la lecture précédente n'est pas finie
 ***************************************************/
void loop()
{
  if (!currently_reading_2 /* && !currently_reading_3 */) {
    read_rfid1();
  }
  if (!currently_reading_1 /* && !currently_reading_3 */) {
    read_rfid2();
  }
  // if (!currently_reading_1 && !currently_reading_2 ) {
  //   read_rfid3();
  // }
}

/***************************************************
   reading first RFID reader
 ***************************************************/
void read_rfid1() {
  char c;
  if (rfid_reader_1.available())
  {
    currently_reading_1 = true;
    c = rfid_reader_1.read();
    decode_tag(c);
  } else {
    currently_reading_1 = false;
  }
}

/***************************************************
   reading second RFID reader
 ***************************************************/
void read_rfid2() {
  char c;
  if (rfid_reader_2.available())
  {
    currently_reading_2 = true;
    c = rfid_reader_2.read();
    decode_tag(c);
  } else {
    currently_reading_2 = false;
  }
}

/***************************************************
   decoding RFID tag
 ***************************************************/
void decode_tag(char c) {
  static int Counter = 0;
  if (isprint(c)) ReceivedCode += c;
  if (c == START) Counter = 0;
  else Counter++;
  if (c == END)
  {
    sendSerial(ReceivedCode);
    ReceivedCode = "";
  }
}

/***************************************************
  sending decoded tag on serial
***************************************************/
void sendSerial(String s) {
  Serial.print("<TAG:");
  Serial.print(s);
  Serial.println(">");
}

