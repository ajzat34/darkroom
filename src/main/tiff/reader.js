// interface for reading data from buffers

class Reader {

  constructor (data) {
    this.data = data
    this.makeReaders(true)
  }

  makeReaders (le) {
    this.little = le
    if (le) {
      this.readUint = function(offset, byteLength){return this.data.readUIntLE(offset, byteLength)}
      this.readInt = function(offset, byteLength){return this.data.readIntLE(offset, byteLength)}
      this.readFloat = function(offset, byteLength){return this.data.readFloatLE(offset)}
      this.readDouble = function(offset, byteLength){return this.data.readDoubleLE(offset)}
    } else {
      this.readUint = function(offset, byteLength){return this.data.readUIntBE(offset, byteLength)}
      this.readInt = function(offset, byteLength){return this.data.readIntBE(offset, byteLength)}
      this.readFloat = function(offset, byteLength){return this.data.readFloatBE(offset)}
      this.readDouble = function(offset, byteLength){return this.data.readDoubleBE(offset)}
    }
  }

  setBigEndian () {
    this.makeReaders(false)
  }
  setLittleEndian () {
    this.makeReaders(true)
  }

  readField (data, offset) {
    return this.readUint(offset+data.offset, data.bytes)
  }

}


module.exports.Reader = Reader
