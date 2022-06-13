// Write class below
class ShiftCipher {
    constructor(shift) {
      this.shift = shift
    }
  
    // methods
    encrypt(string){
        const message = []
        string = string.toLowerCase();

        for (let i=0; i<string.length; i++) {
            let code = string.charCodeAt(i);
            // catch non-alphabetic (lower case) characters
            if (code < 97 | code > 122) {
                message.push(code)
            // catch overflow
            } else if (code + this.shift > 122){
                message.push(code+this.shift - 26)
            } else {
                message.push(code+this.shift)
        }
      }

      console.log(message)
      console.log((String.fromCharCode(...message)).toUpperCase())
    }

    decrypt(string){
        const message = []

        for (let i=0; i<string.length; i++) {
            let code = string.charCodeAt(i);
            // catch non-alphabetic (upper case) characters
            if (code < 65 | code > 90) {
                message.push(code)
            // catch overflow
            } else if (code - this.shift < 65) {
                message.push(code-this.shift + 26)
            } else {
                message.push(code-this.shift)
        }
        
    }

    console.log(message)
    console.log((String.fromCharCode(...message)).toLowerCase())
  }

}

const cipher = new ShiftCipher(1);
// cipher.encrypt('I love to code!'); // returns 'K NQXG VQ EQFG!'
// cipher.decrypt('K <3 OA RWRRA'); // returns 'i <3 my puppy'
cipher.encrypt('Z')