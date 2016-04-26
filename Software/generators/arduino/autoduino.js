//Code generator functions for the AUTODUINO interface

/**
 * @license
 * GPL
 *
 * Copyright 2016 Bernard Remond.
 * https://github.com/nbremond77
 *
 */

/**
 * @fileoverview Helper functions for generating autoduino interface board.
 * @author nbremond@laposte.net (Bernard Remond)
 */

/**
 * @fileoverview Helper functions for generating seeeduino autoduino blocks.
 * @author gasolin@gmail.com (Fred Lin)
 */

myLibrary = "#include <Wire.h>\n\
#include <stdio.h>\n\
#include <inttypes.h>\n\
#include <Arduino.h>\n\
\n\
class gpio_expander {\n\
public:\n\
  gpio_expander( );\n\
  virtual void  begin(bool protocolInitOverride=false) = 0;\n\
protected:\n\
  inline uint16_t   byte2word(byte high_byte,byte low_byte){return (word)high_byte << 8 | (word)low_byte;};\n\
  inline byte     word2highByte(uint16_t data){return (byte)(data >> 8);};\n\
  inline byte     word2lowByte(uint16_t data){return (byte)(data & 0x00FF);};\n\
private:\n\
};\n\
\n\
\n\
class pca9555 : public gpio_expander\n\
{\n\
public:\n\
  pca9555(const uint8_t adrs);\n\
  pca9555();;//used with other libraries only\n\
  void      postSetup(const uint8_t adrs);//used with other libraries only\n\
  virtual void  begin(bool protocolInitOverride=false); //protocolInitOverride=true will not init the SPI \n\
  void      gpioPinMode(uint16_t mode);         //OUTPUT=all out,INPUT=all in,0xxxx=you choose\n\
  void      gpioPinMode(uint8_t pin, bool mode);    //set a unique pin as IN(1) or OUT (0)\n\
  void      gpioPort(uint16_t value);         //HIGH=all Hi, LOW=all Low,0xxxx=you choose witch low or hi\n\
  void      gpioPort(byte lowByte, byte highByte);    //same as abowe but uses 2 separate bytes\n\
  uint16_t    readGpioPort();               //read the state of the pins (all)\n\
  uint16_t    readGpioPortFast();             \n\
  void      gpioDigitalWrite(uint8_t pin, bool value);  //write data to one pin\n\
  void      gpioDigitalWriteFast(uint8_t pin, bool value);\n\
  int       gpioDigitalRead(uint8_t pin);       //read data from one pin\n\
  uint8_t     gpioRegisterReadByte(byte reg);         //read a byte from chip register\n\
  int       gpioDigitalReadFast(uint8_t pin);\n\
  void      gpioRegisterWriteByte(byte reg,byte data);    //write a byte in a chip register\n\
  void      gpioRegisterWriteWord(byte reg,word data);    //write a word in a chip register\n\
  void      portPullup(uint16_t data);            // HIGH=all pullup, LOW=all pulldown,0xxxx=you choose witch\n\
  void      gpioPortUpdate();\n\
  // direct access commands\n\
  uint16_t    readAddress(byte addr);\n\
  //------------------------- REGISTERS\n\
  byte      IODIR;//GPCONF\n\
  byte      GPPU;//GPO\n\
  byte      GPIO;//GPI\n\
  byte      IPOL;//GPPOL\n\
private:\n\
  uint8_t     _adrs;\n\
  uint16_t    _gpioDirection;\n\
  uint16_t    _gpioState;\n\
  bool      _error;\n\
  void      writeByte(byte addr, byte data);  \n\
  void      writeWord(byte addr, uint16_t data);\n\
};\n\
\n\
gpio_expander::gpio_expander() \n\
{\n\
}\n\
\n\
\n\
pca9555::pca9555(){\n\
}\n\
\n\
pca9555::pca9555(const uint8_t adrs){\n\
  postSetup(adrs);\n\
}\n\
\n\
void pca9555::postSetup(const uint8_t adrs){\n\
  if (adrs >= 0x20 && adrs <= 0x27){//basic addressing\n\
    _adrs = adrs;\n\
    _error = false;\n\
  } else if (adrs >= 0x28 && adrs <= 0xDE){//advanced addressing\n\
    //todo\n\
    _error = false;\n\
  } else {\n\
    _error = true;\n\
  }\n\
  //setup register values for this chip\n\
  IODIR =   0x06;//Configuration Registers (0x06..0x07)\n\
  GPPU =    0x02;//Output Port Registers (0x02..0x03)\n\
  GPIO =    0x00;//Input Port Registers (0x00..0x01)\n\
  IPOL =    0x04;//Polarity Inversion Registers (0x04..0x05)(\n\
}\n\
\n\
void pca9555::begin(bool protocolInitOverride) {\n\
  if (!protocolInitOverride && !_error){\n\
    Wire.begin();\n\
    #if ARDUINO >= 157\n\
      Wire.setClock(400000UL); // Set I2C frequency to 400kHz\n\
    #else\n\
      TWBR = ((F_CPU / 400000UL) - 16) / 2; // Set I2C frequency to 400kHz\n\
    #endif\n\
  }\n\
  delay(100);\n\
  _gpioDirection = 0xFFFF;//all in\n\
  _gpioState = 0x0000;//all low \n\
}\n\
\n\
\n\
\n\
\n\
uint16_t pca9555::readAddress(byte addr){\n\
  byte low_byte = 0;\n\
  byte high_byte = 0;\n\
  if (!_error){\n\
    Wire.beginTransmission(_adrs);\n\
    Wire.write(addr);//witch register?\n\
    //Wire.endTransmission();\n\
    Wire.endTransmission(false);// looks like in this way it works!\n\
    Wire.requestFrom((uint8_t)_adrs,(uint8_t)2);\n\
    low_byte = Wire.read();\n\
    high_byte = Wire.read();\n\
  } \n\
  return byte2word(high_byte,low_byte);\n\
}\n\
\n\
\n\
\n\
void pca9555::gpioPinMode(uint16_t mode){\n\
  if (mode == INPUT){\n\
    _gpioDirection = 0xFFFF;\n\
  } else if (mode == OUTPUT){ \n\
    _gpioDirection = 0x0000;\n\
    _gpioState = 0x0000;\n\
  } else {\n\
    _gpioDirection = mode;\n\
  }\n\
  writeWord(IODIR,_gpioDirection);\n\
}\n\
\n\
void pca9555::gpioPinMode(uint8_t pin, bool mode){\n\
  if (pin < 16){//0...15\n\
    mode == INPUT ? _gpioDirection |= (1 << pin) :_gpioDirection &= ~(1 << pin);\n\
    writeWord(IODIR,_gpioDirection);\n\
  }\n\
}\n\
\n\
void pca9555::gpioPort(uint16_t value){\n\
  if (value == HIGH){\n\
    _gpioState = 0xFFFF;\n\
  } else if (value == LOW){ \n\
    _gpioState = 0x0000;\n\
  } else {\n\
    _gpioState = value;\n\
  }\n\
  writeWord(GPIO,_gpioState);\n\
}\n\
\n\
void pca9555::gpioPort(byte lowByte, byte highByte){\n\
  _gpioState = byte2word(highByte,lowByte);\n\
  writeWord(GPIO,_gpioState);\n\
}\n\
\n\
\n\
uint16_t pca9555::readGpioPort(){\n\
  return readAddress(GPIO);\n\
}\n\
\n\
uint16_t pca9555::readGpioPortFast(){\n\
  return _gpioState;\n\
}\n\
\n\
int pca9555::gpioDigitalReadFast(uint8_t pin){\n\
  int temp = 0;\n\
  if (pin < 16) temp = bitRead(_gpioState,pin);\n\
  return temp;\n\
}\n\
\n\
\n\
\n\
\n\
void pca9555::gpioDigitalWrite(uint8_t pin, bool value){\n\
  if (pin < 16){//0...15\n\
    value == HIGH ? _gpioState |= (1 << pin) : _gpioState &= ~(1 << pin);\n\
    writeWord(GPPU,_gpioState);\n\
  }\n\
}\n\
\n\
void pca9555::gpioDigitalWriteFast(uint8_t pin, bool value){\n\
  if (pin < 16){//0...15\n\
    value == HIGH ? _gpioState |= (1 << pin) : _gpioState &= ~(1 << pin);\n\
  }\n\
}\n\
\n\
void pca9555::gpioPortUpdate(){\n\
  writeWord(GPIO,_gpioState);\n\
}\n\
\n\
int pca9555::gpioDigitalRead(uint8_t pin){\n\
  if (pin < 16) return (int)(readAddress(GPIO) & 1 << pin);\n\
  return 0;\n\
}\n\
\n\
uint8_t pca9555::gpioRegisterReadByte(byte reg){\n\
  uint8_t data = 0;\n\
  if (!_error){\n\
    Wire.beginTransmission(_adrs);\n\
    Wire.write(reg);\n\
    Wire.endTransmission();\n\
    Wire.requestFrom((uint8_t)_adrs,(uint8_t)1);\n\
    data = Wire.read();\n\
  }\n\
  return data;\n\
}\n\
\n\
\n\
void pca9555::gpioRegisterWriteByte(byte reg,byte data){\n\
  writeByte(reg,(byte)data);\n\
}\n\
\n\
void pca9555::gpioRegisterWriteWord(byte reg,word data){\n\
  writeWord(reg,(word)data);\n\
}\n\
\n\
/* ------------------------------ Low Level ----------------*/\n\
void pca9555::writeByte(byte addr, byte data){\n\
  if (!_error){\n\
    Wire.beginTransmission(_adrs);\n\
    Wire.write(addr);//witch register?\n\
    Wire.write(data);\n\
    Wire.endTransmission();\n\
  }\n\
}\n\
\n\
void pca9555::writeWord(byte addr, uint16_t data){\n\
  if (!_error){\n\
    Wire.beginTransmission(_adrs);\n\
    Wire.write(addr);//witch register?\n\
    Wire.write(word2lowByte(data));\n\
    Wire.write(word2highByte(data));\n\
    Wire.endTransmission();\n\
  }\n\
}";



var _get_next_pin = function(dropdown_pin) { // TO BE UPDATED
  var pos = -1;
    //check if NextPIN in bound
  if(parseInt(dropdown_pin)){
    var NextPIN = parseInt(dropdown_pin)+1;
    pos = profile.defaultBoard.digital.indexOf(String(NextPIN));
  } else {
    var NextPIN = 'A'+(parseInt(dropdown_pin.slice(1,dropdown_pin.length))+1);
    pos = profile.defaultBoard.analog.indexOf(String(NextPIN));
  }
  if(pos < 0){
//    alert("Autoduino Sensor needs PIN#+1 port, current setting is out of bound.");
    return null;
  } else {
    return NextPIN;
  }
};


function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16);};
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16);};
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16);};
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h;};


goog.provide('Blockly.Arduino.autoduino');

goog.require('Blockly.Arduino');

var lib="";

function setOutput(pin, stat) {
    Blockly.Arduino.definitions_['myLibrary'] = myLibrary;
    Blockly.Arduino.definitions_['define_gpio_expander3'] = 'pca9555 mcp;';
    Blockly.Arduino.definitions_['define_gpio_expander4'] = 'byte GPPU = 0x02; //Output Port Registers (0x02..0x03)';

    Blockly.Arduino.definitions_['setup_autoduino_mcp_a1_begin_init_port_direction'] = "volatile byte directionPort0 = 0x1F; // IN7 and IN8 are inputs\n"+
    "volatile byte directionPort1 = 0x00;\n" +
    "volatile uint16_t pca9555Inputs = 0; // state of the PCA9555 input register\n" +
    "volatile word valuePort = 0x0000;\n";
    
    var code = "";
    
    switch(pin) {
        case "3":
        case "4":
        case "7":
        case "8":
        case 'A0':
        case 'A1':
        case 'A2':
        case 'A3':
            Blockly.Arduino.setups_['setup_autoduino_led_'+pin] = 'pinMode('+pin+', OUTPUT);';
            code = code + 'digitalWrite('+pin+','+stat+');\n';
            break;
        case '33':
        case '34':
        case '35':
        case '36':
        case '37':
        case '40':
        case '41':
        case '42':
        case '43':
        case '44':
        case '45':
            Blockly.Arduino.setups_['define_gpio_instance_0'] = 'mcp.postSetup(0x20); // PCA9555 instance, A2 A1 A0 are set to 000';
            Blockly.Arduino.setups_['setup_autoduino_mcp_begin'] = 'mcp.begin();';
            if (pin < 38) {
                Blockly.Arduino.setups_['setup_autoduino_mcp_led_1_'+pin] = "directionPort0 = directionPort0 & (~(1<<("+ (pin-30) +")));\n";
            }
            else if (pin < 48) {
                Blockly.Arduino.setups_['setup_autoduino_mcp_led_1_'+pin] = "directionPort1 = directionPort1 & (~(1<<("+ (pin-38) +")));\n";
            }
            Blockly.Arduino.setups_['setup_autoduino_mcp_led_2_'+pin] = "mcp.gpioPinMode(directionPort1<<8 | directionPort0);\n";
            
            if (stat == "HIGH") {
                code = code + "valuePort = valuePort | 1<<("+ (pin-30) +"); // HIGH\n";
            }
            else {
                code = code + "valuePort = valuePort & (~(1<<("+ (pin-30) +"))); // LOW\n";
            }
            code = code + "mcp.gpioRegisterWriteWord(GPPU, valuePort);\n";
            break;
        default:
            code = code + "// ERROR in  pin number ["+pin+"]\n";
    };   
  return code;
};


function getInput(pin) {
    Blockly.Arduino.definitions_['myLibrary'] = myLibrary;
    Blockly.Arduino.definitions_['define_gpio_expander3'] = 'pca9555 mcp;';
    Blockly.Arduino.definitions_['define_gpio_expander4'] = 'byte GPPU = 0x02; //Output Port Registers (0x02..0x03)';

    Blockly.Arduino.definitions_['setup_autoduino_mcp_a1_begin_init_port_direction'] = "volatile byte directionPort0 = 0x1F; // IN7 and IN8 are inputs\n"+
    "volatile byte directionPort1 = 0x00;\n" +
    "volatile uint16_t pca9555Inputs = 0; // state of the PCA9555 input register\n" +
    "volatile word valuePort = 0x0000;\n";
    Blockly.Arduino.definitions_['setup_autoduino_mcp_a3_begin_init_port_read'] = "int getMcpInput(int pin) {\n" + 
    "  pca9555Inputs = mcp.readGpioPort();\n" +
    "  int w = (pca9555Inputs>>(pin-30)) & 0x0001;\n" +
    "  return w;\n" +
    "}\n";
    
    var code = "";
    
    switch(pin) {
        case "3":
        case "4":
        case "7":
        case "8":
        case 'A0':
        case 'A1':
        case 'A2':
        case 'A3':
            Blockly.Arduino.setups_['setup_autoduino_led_'+pin] = 'pinMode('+pin+', INPUT);';
            code = 'digitalRead('+pin+')';
            break;
        case '33':
        case '34':
        case '40':
        case '41':
        case '42':
        case '43':
        case '44':
        case '45':
            Blockly.Arduino.setups_['define_gpio_instance_0'] = 'mcp.postSetup(0x20); // PCA9555 instance, A2 A1 A0 are set to 000';
            Blockly.Arduino.setups_['setup_autoduino_mcp_begin'] = 'mcp.begin();';
            if (pin < 38) {
                Blockly.Arduino.setups_['setup_autoduino_mcp_push_1_'+pin] = "directionPort0 = directionPort0  | (1<<"+(pin-30)+");";
            }
            else if (pin < 48) {
                Blockly.Arduino.setups_['setup_autoduino_mcp_push_1_'+pin] = "directionPort1 = directionPort1  | (1<<"+(pin-38)+");";
            }
            Blockly.Arduino.setups_['setup_autoduino_mcp_push_2_'+pin] = "mcp.gpioPinMode(directionPort1<<8 | directionPort0);";

            code = "getMcpInput("+pin+")";
            break;
        default:
            code = "// ERROR in  pin number ["+pin+"]";
    };
  return code;
};


/** ****************** CAPTEURS ******************************/

Blockly.Arduino.autoduino_button = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var code =getInput(dropdown_pin);
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.autoduino_rotary_angle = function() { // TO BE UPDATED
    var code = '0; // TO BE DONE';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.autoduino_potentiometer = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  var code = 'analogRead('+dropdown_pin+')';
  Blockly.Arduino.setups_['setup_autoduino_potentiometer_sensor_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_dht_read = function() { // TO BE UPDATED
    var sensor = this.getFieldValue('SENSOR');
    var pin = this.getFieldValue('PIN');
    var type = this.getFieldValue('TYPE');

    var code = '';
    switch(type){
        case 'h':
    //      code += 'floatToStr(dht_' + pin + '_' + sensor + '.readHumidity()) + "%"';
        code += '(int)(dht_' + pin + '_' + sensor + '.readHumidity())';
        break;
        case 'C':
    //        code += 'floatToStr(dht_' + pin + '_' + sensor + '.readTemperature()) + "C"';
            code += '(int)(dht_' + pin + '_' + sensor + '.readTemperature())';
        break;
        case 'F':
    //        code += 'floatToStr(dht_' + pin + '_' + sensor + '.readTemperature(true)) + "F"';
            code += '(int)(dht_' + pin + '_' + sensor + '.readTemperature(true))';
        break;
    };

    Blockly.Arduino.definitions_['define_autoduino_dht_'+ pin + '_' + sensor] = '#include <DHT.h>\n'
    + 'DHT dht_' + pin + '_' + sensor + '(' + pin + ',' + sensor + ');\n';

    Blockly.Arduino.setups_['setup_autoduino_dht_' + pin + '_' + sensor] = 'dht_' + pin + '_' + sensor + '.begin();\n';
    /*
    Blockly.Arduino.definitions_['define_dht_floatToStr'] = 'String floatToStr(float val){\n'
    + '  int buf = (int)val;\n'
    + '  String str = String(buf);\n'
    + '  str += ".";\n'
    + '  str += String((int)(val*10)-buf*10);\n'
    + '  return str;\n'
    + '}\n';
    */
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};



Blockly.Arduino.autoduino_temperature_sensor = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  /*
  a=analogRead(0);
  resistance=(float)(1023-a)*10000/a;
  temperature=1/(log(resistance/10000)/B+1/298.15)-273.15;
  */
  var code = 'round( 1/(log((float)(1023-analogRead('+dropdown_pin+'))*10000/analogRead('+dropdown_pin+')/10000)/3975+1/298.15)-273.15'+')';
  Blockly.Arduino.setups_['setup_autoduino_temperature_sensor_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.autoduino_moisture_sensor = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  var code = 'analogRead('+dropdown_pin+')';
  Blockly.Arduino.setups_['setup_autoduino_moisture_sensor_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_tilt_switch = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var code =getInput(dropdown_pin);
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_ils_switch = function() {
  var dropdown_pin = this.getFieldValue('PIN');
  var code =getInput(dropdown_pin);
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.autoduino_pir_motion_sensor = function() {
  var dropdown_pin = this.getFieldValue('PIN');
  var code =getInput(dropdown_pin);
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_ultrasonic_ranger = function() {
  var dropdown_pin = this.getFieldValue('PIN');
  var dropdown_unit = this.getFieldValue('UNIT');
  Blockly.Arduino.definitions_['define_autoduino_ultrasonic'] = '#include <Ultrasonic.h>\n';
  Blockly.Arduino.definitions_['var_autoduino_ultrasonic'+dropdown_pin] = 'Ultrasonic ultrasonic_'+dropdown_pin+'('+dropdown_pin+');\n';
  var code;
  if(dropdown_unit==="cm"){
    Blockly.Arduino.setups_['setup_autoduino_ultrasonic_'+dropdown_pin] = 'ultrasonic_'+dropdown_pin+'.MeasureInCentimeters();';
    code = 'ultrasonic_'+dropdown_pin+'.RangeInCentimeters();';
  } else {
    Blockly.Arduino.setups_['setup_autoduino_ultrasonic_'+dropdown_pin] = 'ultrasonic_'+dropdown_pin+'.MeasureInInches();';
    code = 'ultrasonic_'+dropdown_pin+'.RangeInInches();';
  }
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_LDR_sensor = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  var code = 'round(1517.288685*exp(-64.822510*analogRead('+dropdown_pin+')/10000))';
  Blockly.Arduino.setups_['setup_autoduino_LDR_sensor_'+dropdown_pin] = 'pinMode('+dropdown_pin+', INPUT);';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_line_finder = function() {
  var dropdown_pin1 = this.getFieldValue('PIN');
  var code =getInput(dropdown_pin);
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino.autoduino_ir_switch = function() {
  var dropdown_pin = this.getFieldValue('PIN');
  var code =getInput(dropdown_pin);
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
/** ****************** ACTIONNEURS ******************************/

Blockly.Arduino.autoduino_led = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var dropdown_stat = this.getFieldValue('STAT');
    var code = "// PROCESSING pin number [" + dropdown_pin + "] as Output = " + dropdown_stat + "\n";
    code = code + setOutput(dropdown_pin, dropdown_stat);
    return code;
};


Blockly.Arduino.autoduino_led_eclairage = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var dropdown_stat = this.getFieldValue('STAT');
    var code = "// PROCESSING pin number [" + dropdown_pin + "] as Output = " + dropdown_stat + "\n";
    code = code + setOutput(dropdown_pin, dropdown_stat);
    return code;
};


Blockly.Arduino.autoduino_IR_led = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var dropdown_stat = this.getFieldValue('STAT');
    var code = "// PROCESSING pin number [" + dropdown_pin + "] as Output = " + dropdown_stat + "\n";
    code = code + setOutput(dropdown_pin, dropdown_stat);
    return code;
};



Blockly.Arduino.autoduino_rgb_led = function() {
    var dropdown_stat_C1 = Blockly.Arduino.valueToCode(this, 'C1', Blockly.Arduino.ORDER_ATOMIC);
    var dropdown_stat_C2 = Blockly.Arduino.valueToCode(this, 'C2', Blockly.Arduino.ORDER_ATOMIC);
    var dropdown_stat_C3 = Blockly.Arduino.valueToCode(this, 'C3', Blockly.Arduino.ORDER_ATOMIC);
    var pixel_number = Blockly.Arduino.valueToCode(this, 'Pixel_number', Blockly.Arduino.ORDER_ATOMIC);
    var numpixels = this.getFieldValue('Number_of_Pixels');
    var pin_ledrgb = this.getFieldValue('PIN');
    
    Blockly.Arduino.definitions_['define_autoduino_WS2812B'] = '#include <Adafruit_NeoPixel.h>\n'; 
    Blockly.Arduino.definitions_['define_autoduino_WS2812B_'+pin_ledrgb] = 'Adafruit_NeoPixel pixels_'+pin_ledrgb+' = Adafruit_NeoPixel('+numpixels+', '+pin_ledrgb+', NEO_GRB + NEO_KHZ800);\n'; 
    Blockly.Arduino.setups_['setup_autoduino_WS2812B_0_'+pin_ledrgb] = 'pinMode('+pin_ledrgb+', OUTPUT);';
    Blockly.Arduino.setups_['setup_autoduino_WS2812B_1_'+pin_ledrgb] = 'pixels_'+pin_ledrgb+'.begin();\n';
  
    var code = 'pixels_'+pin_ledrgb+'.setPixelColor('+(pixel_number-1)+', pixels_'+pin_ledrgb+'.Color('+dropdown_stat_C1+','+dropdown_stat_C2+','+dropdown_stat_C3+'));\n';
    code    += 'pixels_'+pin_ledrgb+'.show();\n';
    return code;
};



Blockly.Arduino.autoduino_rgb_led2 = function() {
    var colour_name = this.getFieldValue('C');
    var pixel_number = Blockly.Arduino.valueToCode(this, 'Pixel_number', Blockly.Arduino.ORDER_ATOMIC);
    var numpixels = this.getFieldValue('Number_of_Pixels');
    var pin_ledrgb = this.getFieldValue('PIN');
    
    Blockly.Arduino.definitions_['define_autoduino_WS2812B'] = '#include <Adafruit_NeoPixel.h>\n'; 
    Blockly.Arduino.definitions_['define_autoduino_WS2812B_'+pin_ledrgb] = 'Adafruit_NeoPixel pixels_'+pin_ledrgb+' = Adafruit_NeoPixel('+numpixels+', '+pin_ledrgb+', NEO_GRB + NEO_KHZ800);\n'; 
    Blockly.Arduino.setups_['setup_autoduino_WS2812B_0_'+pin_ledrgb] = 'pinMode('+pin_ledrgb+', OUTPUT);';
    Blockly.Arduino.setups_['setup_autoduino_WS2812B_1_'+pin_ledrgb] = 'pixels_'+pin_ledrgb+'.begin();\n';
  
    var code = 'pixels_'+pin_ledrgb+'.setPixelColor('+(pixel_number-1)+', pixels_'+pin_ledrgb+'.Color('+hexToR(colour_name) +','+hexToG(colour_name) +','+hexToB(colour_name) +'));\n';
    code    += 'pixels_'+pin_ledrgb+'.show();\n';
    return code;
};



Blockly.Arduino.autoduino_piezo_buzzer = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var frequency = this.getFieldValue('Frequency');
    var duration = this.getFieldValue('Duration');
    var code = "// PROCESSING pin number [" + dropdown_pin + "] as Buzzer output. Frequency = " + frequency + " Duration: "+duration+"\n";
    Blockly.Arduino.setups_['setup_autoduino_buzzer_'+dropdown_pin] = 'pinMode('+dropdown_pin+', OUTPUT);';
    code = code + "tone("+dropdown_pin+", "+frequency+", "+duration+");";
    return code;
};

Blockly.Arduino.autoduino_relay = function() {
    var dropdown_pin = this.getFieldValue('PIN');
    var dropdown_stat = this.getFieldValue('STAT');
    var code = "// PROCESSING pin number [" + dropdown_pin + "] as Output = " + dropdown_stat + "\n";
    code = code + setOutput(dropdown_pin, dropdown_stat);
    return code;
};



Blockly.Arduino.autoduino_motor_shield = function() {
  var dropdown_pin1 = this.getFieldValue('PIN1');
  var dropdown_pin2 = this.getFieldValue('PIN2');
  var dropdown_pin3 = this.getFieldValue('PIN3');
  var dropdown_pin4 = this.getFieldValue('PIN4');
  var dropdown_direction = this.getFieldValue('DIRECTION');
  var code = "";

  if(dropdown_direction==="forward"){
    code = code + setOutput(dropdown_pin1, "HIGH");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "HIGH");
  } else if (dropdown_direction==="right") {
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "HIGH");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "HIGH");
  } else if (dropdown_direction==="left") {
    code = code + setOutput(dropdown_pin1, "HIGH");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "HIGH");
    code = code + setOutput(dropdown_pin4, "LOW");
  } else if (dropdown_direction==="backward"){
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "HIGH");
    code = code + setOutput(dropdown_pin3, "HIGH");
    code = code + setOutput(dropdown_pin4, "LOW");
  } else if (dropdown_direction==="stop"){
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "LOW");
  }
  return code;
};


Blockly.Arduino.autoduino_motor_builtin = function() {
  //#define Motor1_1  34 // 0x10 // 34
  //#define Motor1_2  35 // 0x20 // 35
  //#define Motor2_1  36 // 0x40 // 36
  //#define Motor2_2  37 // 0x80 // 37
  //#define Motor1_EN  5
  //#define Motor2_EN  6
    
  var dropdown_pin1 = "34";
  var dropdown_pin2 = "35";
  var dropdown_pin3 = "36";
  var dropdown_pin4 = "37";
  var Motor1_EN = "5";
  var Motor2_EN = "6";
  var dropdown_direction = this.getFieldValue('DIRECTION');
  var speed = Blockly.Arduino.valueToCode(this, 'SPEED', Blockly.Arduino.ORDER_ATOMIC);
  
  var code = "";
  if(dropdown_direction==="forward"){
    code = code + "analogWrite("+Motor1_EN+", 0);\n";
    code = code + "analogWrite("+Motor2_EN+", 0);\n";
    code = code + "delay(50);\n";
    code = code + setOutput(dropdown_pin1, "HIGH");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "HIGH");
    code = code + "analogWrite("+Motor1_EN+", "+speed+");\n";
    code = code + "analogWrite("+Motor2_EN+", "+speed+");\n";
  } else if (dropdown_direction==="right") {
    code = code + "analogWrite("+Motor1_EN+", 0);\n";
    code = code + "analogWrite("+Motor2_EN+", 0);\n";
    code = code + "delay(50);";
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "HIGH");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "HIGH");
    code = code + "analogWrite("+Motor1_EN+", "+speed+");\n";
    code = code + "analogWrite("+Motor2_EN+", "+speed+");\n";
  } else if (dropdown_direction==="left") {
    code = code + "analogWrite("+Motor1_EN+", 0);\n";
    code = code + "analogWrite("+Motor2_EN+", 0);\n";
    code = code + "delay(50);\n";
    code = code + setOutput(dropdown_pin1, "HIGH");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "HIGH");
    code = code + setOutput(dropdown_pin4, "LOW");
    code = code + "analogWrite("+Motor1_EN+", "+speed+");\n";
    code = code + "analogWrite("+Motor2_EN+", "+speed+");\n";
  } else if (dropdown_direction==="backward"){
    code = code + "analogWrite("+Motor1_EN+", 0);\n";
    code = code + "analogWrite("+Motor2_EN+", 0);\n";
    code = code + "delay(50);\n";
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "HIGH");
    code = code + setOutput(dropdown_pin3, "HIGH");
    code = code + setOutput(dropdown_pin4, "LOW");
    code = code + "analogWrite("+Motor1_EN+", "+speed+");\n";
    code = code + "analogWrite("+Motor2_EN+", "+speed+");\n";
  } else if (dropdown_direction==="stop"){
    code = code + "analogWrite("+Motor1_EN+", 0);\n";
    code = code + "analogWrite("+Motor2_EN+", 0);\n";
    code = code + setOutput(dropdown_pin1, "LOW");
    code = code + setOutput(dropdown_pin2, "LOW");
    code = code + setOutput(dropdown_pin3, "LOW");
    code = code + setOutput(dropdown_pin4, "LOW");
  }
  return code;
};



/** ****************** LCD ******************************/

Blockly.Arduino.autoduino_lcdinit = function() {
  var dropdown_I2C_adress = this.getTitleValue('I2C_adress');
  var dropdown_nbcol = this.getTitleValue('nbcol');
  var dropdown_nblig = this.getTitleValue('nblig');
  var dropdown_cursor = this.getTitleValue('cursor');
  var dropdown_blink = this.getTitleValue('blink');
  var dropdown_backlight = this.getTitleValue('backlight');
  Blockly.Arduino.definitions_['define_autoduino_Wire'] = '#include <Wire.h>\n';
  Blockly.Arduino.definitions_['define_autoduino_LiquidCrystal_I2C'] = '#include <LiquidCrystal_I2C.h>\n';
  Blockly.Arduino.definitions_['var_autoduino_lcd'] = 'LiquidCrystal_I2C lcd('+dropdown_I2C_adress+','+dropdown_nbcol+','+dropdown_nblig+');\n';
  var mysetup='lcd.init();\n';
  if (dropdown_backlight=="TRUE")
  {
    mysetup+='lcd.backlight();\n';
  } else
  {
    mysetup+='lcd.noBacklight();\n';
  }
  if (dropdown_cursor=="TRUE")
  {
    mysetup+='lcd.cursor();\n';
  } else
  {
    mysetup+='lcd.noCursor();\n';
  }
  if (dropdown_blink=="TRUE")
  {
    mysetup+='lcd.blink();\n';
  } else
  {
    mysetup+='lcd.noBlink();\n';
  }
  Blockly.Arduino.setups_['setup_autoduino_lcd'] = mysetup;
  var code="";
  return code;
};

Blockly.Arduino.autoduino_lcdwrite = function() {
  var text = Blockly.Arduino.valueToCode(this, 'TEXT', Blockly.Arduino.ORDER_UNARY_POSTFIX) || '\'\'';
  var dropdown_col = this.getFieldValue('COL');
  var dropdown_lig = this.getFieldValue('LIG');  
  Blockly.Arduino.definitions_['define_autoduino_LiquidCrystal'] = '#include <ShiftRegLCD123.h>\n'; 
  Blockly.Arduino.definitions_['var_autoduino_lcd'] = 'ShiftRegLCD123 lcd(12,13,SRLCD123);\n';
  //dans le setup    
  Blockly.Arduino.setups_["setup_autoduino_lcd"] = "lcd.begin(16,2);";
  var code = 'lcd.setCursor('+dropdown_col+','+dropdown_lig+');\n'+
  'lcd.print('+text+');\n';
  return code;
};


Blockly.Arduino.autoduino_lcdprint = function() {
  var text = Blockly.Arduino.valueToCode(this, 'TEXT', Blockly.Arduino.ORDER_ATOMIC);
  var dropdown_col = this.getFieldValue('COL');
  var dropdown_lig = this.getFieldValue('LIG');  
  Blockly.Arduino.definitions_['define_autoduino_LiquidCrystal'] = '#include <ShiftRegLCD123.h>\n'; 
  Blockly.Arduino.definitions_['var_autoduino_lcd'] = 'ShiftRegLCD123 lcd(12,13,SRLCD123);\n';
  //dans le setup    
  Blockly.Arduino.setups_["setup_autoduino_lcd"] = "lcd.begin(16,2);";
  var code = 'lcd.setCursor('+dropdown_col+','+dropdown_lig+');\n'+
  'lcd.print('+text+');\n';
  return code;
};

Blockly.Arduino.autoduino_lcdspecial = function() {
  var dropdown_special = this.getTitleValue('special');
  var code="lcd."+dropdown_special+"();\n";
  Blockly.Arduino.definitions_['define_autoduino_LiquidCrystal'] = '#include <ShiftRegLCD123.h>\n'; 
  Blockly.Arduino.definitions_['var_autoduino_lcd'] = 'ShiftRegLCD123 lcd(12,13,SRLCD123);\n';
  //dans le setup    
  Blockly.Arduino.setups_["setup_autoduino_lcd"] = "lcd.begin(16,2);";    
  return code;
};

Blockly.Arduino.autoduino_lcdclear = function() {
  var code = 'lcd.clear();\n';
  Blockly.Arduino.definitions_['define_autoduino_LiquidCrystal'] = '#include <LiquidCrystal.h>\n'; 
  Blockly.Arduino.definitions_['var_autoduino_lcd'] = 'LiquidCrystal lcd(12,11,5,13,3,2);\n';  
  //dans le setup    
  Blockly.Arduino.setups_["setup_autoduino_lcd"] = "lcd.begin(16,2);";    
  return code;
};

/** ****************** COMMUNICATION ******************************/




Blockly.Arduino.autoduino_bluetooth_slave = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  var NextPIN = _get_next_pin(dropdown_pin);
  var name = this.getFieldValue('NAME');
//  var pincode = this.getFieldValue('PINCODE');
  var statement_receive = Blockly.Arduino.statementToCode(this, "RCV");
  var statement_send = Blockly.Arduino.statementToCode(this, "SNT");
  /* if(pincode.length != 4){
    alert("pincode length should be 4");
  } */
  Blockly.Arduino.definitions_['define_autoduino_softwareserial'] = '#include <SoftwareSerial.h>\n';
  Blockly.Arduino.definitions_['var_autoduino_bluetooth_'+dropdown_pin] = 'SoftwareSerial blueToothSerial_'+dropdown_pin+'('+dropdown_pin+','+NextPIN+');\n';

  Blockly.Arduino.setups_['setup_autoduino_bluetooth_'+dropdown_pin] = 'Serial.begin(9600);\n';
  Blockly.Arduino.setups_['setup_autoduino_bluetooth_'+dropdown_pin] += '  pinMode('+dropdown_pin+', INPUT);\n';
  Blockly.Arduino.setups_['setup_autoduino_bluetooth_'+dropdown_pin] += '  pinMode('+NextPIN+', OUTPUT);\n';
  Blockly.Arduino.setups_['setup_autoduino_bluetooth_'+dropdown_pin] += '  setupBlueToothConnection_'+dropdown_pin+'();\n';

  Blockly.Arduino.definitions_['define_autoduino_setupBlueToothConnection_'+dropdown_pin] = 'void setupBlueToothConnection_'+dropdown_pin+'()\n'+
  '{\n'+
  '  blueToothSerial_'+dropdown_pin+'.begin(38400); //Set BluetoothBee BaudRate to default baud rate 38400\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+STWMOD=0\\r\\n"); //set the bluetooth work in slave mode\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+STNA='+name+'\\r\\n"); //set the bluetooth name as "'+name+'"\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+STPIN=0000\\r\\n");//Set SLAVE pincode"0000"\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+STOAUT=1\\r\\n"); // Permit Paired device to connect me\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+STAUTO=0\\r\\n"); // Auto-connection should be forbidden here\n'+
  '  delay(2000); // This delay is required.\n'+
  '  blueToothSerial_'+dropdown_pin+'.print("\\r\\n+INQ=1\\r\\n"); //make the slave bluetooth inquirable \n'+
  '  Serial.println("The slave bluetooth is inquirable!");\n'+
  '  delay(2000); // This delay is required.\n'+
  '  blueToothSerial_'+dropdown_pin+'.flush();\n'+
  '}\n';
  var code = 'char recvChar_'+dropdown_pin+';\n'+
  'while(1) {\n'+
  '  if(blueToothSerial_'+dropdown_pin+'.available()) {//check if there is any data sent from the remote bluetooth shield\n'+
  '    recvChar_'+dropdown_pin+' = blueToothSerial_'+dropdown_pin+'.read();\n'+
  '    Serial.print(recvChar_'+dropdown_pin+');\n'+
       statement_receive+
  '  }\n'+
  '  if(Serial.available()){//check if there is any data sent from the local serial terminal, you can add the other applications here\n'+
  '    recvChar_'+dropdown_pin+' = Serial.read();\n'+
  '    blueToothSerial_'+dropdown_pin+'.print(recvChar_'+dropdown_pin+');\n'+
       statement_send+
  '  }\n'+
  '}\n';
  return code;
};


Blockly.Arduino.autoduino_rc = function() { // TO BE UPDATED
  var dropdown_pin = this.getFieldValue('PIN');
  var dropdown_stat = this.getFieldValue('STAT');

  Blockly.Arduino.definitions_['define_autoduino_seriallcd'] = '#include <SerialLCD.h>\n';
  Blockly.Arduino.definitions_['define_autoduino_softwareserial'] = '#include <SoftwareSerial.h>\n';
  //generate PIN#+1 port
  var NextPIN = _get_next_pin(dropdown_pin);

  Blockly.Arduino.definitions_['var_lcd'+dropdown_pin] = 'SerialLCD slcd_'+dropdown_pin+'('+dropdown_pin+','+NextPIN+');\n';
  var code = 'slcd_'+dropdown_pin;
  if(dropdown_stat==="LEFT"){
    code += '.scrollDisplayLeft();\n';
  } else if(dropdown_stat==="RIGHT"){
    code += '.scrollDisplayRight();\n';
  } else {
    code += '.autoscroll();\n';
  }
  return code;
};

