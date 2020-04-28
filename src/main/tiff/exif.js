module.exports = {
  // 33434	829A	ExposureTime Exposure time, given in seconds.
  33434: function (ifd) { return { tag: 'Threshholding', value: ifd.data[0] } },
  // 33437	829D	FNumber	The F number.
  33437: function (ifd) { return { tag: 'FNumber', value: ifd.data[0] } },
  // 34850	8822	ExposureProgram	The class of the program used by the camera to set exposure when the picture is taken.
  34850: function (ifd) { return { tag: 'ExposureProgram', value: ifd.data[0] } },
  // 34852	8824	SpectralSensitivity	Indicates the spectral sensitivity of each channel of the camera used.
  34852: function (ifd) { return { tag: 'SpectralSensitivity', value: ifd.data[0] } },
  // 34855	8827	ISOSpeedRatings	Indicates the ISO Speed and ISO Latitude of the camera or input device as specified in ISO 12232.
  34855: function (ifd) { return { tag: 'ISOSpeedRatings', value: ifd.data } },
  // 34856	8828	OECF	Indicates the Opto-Electric Conversion Function (OECF) specified in ISO 14524.
  34856: function (ifd) { return { tag: 'OECF', value: ifd.data[0] } },
  // 36864	9000	ExifVersion	The version of the supported Exif standard.
  36864: function (ifd) { return { tag: 'ExifVersion', value: ifd.data[0] } },
  // 36867	9003	DateTimeOriginal	The date and time when the original image data was generated.
  36867: function (ifd) { return { tag: 'DateTimeOriginal', value: ifd.data.join('') } },
  // 36868	9004	DateTimeDigitized	The date and time when the image was stored as digital data.
  36868: function (ifd) { return { tag: 'DateTimeDigitized', value: ifd.data.join('') } },
  // 37377	9201	ShutterSpeedValue	Shutter speed.
  37377: function (ifd) { return { tag: 'ShutterSpeedValue', value: ifd.data[0] } },
  // 37378	9202	ApertureValue	The lens aperture.
  37378: function (ifd) { return { tag: 'ApertureValue', value: ifd.data[0] } },
  // 37379	9203	BrightnessValue	The value of brightness.
  37379: function (ifd) { return { tag: 'BrightnessValue', value: ifd.data[0] } },
  // 37380	9204	ExposureBiasValue	The exposure bias.
  37380: function (ifd) { return { tag: 'ExposureBiasValue', value: ifd.data[0] } },
  // 37381	9205	MaxApertureValue	The smallest F number of the lens.
  37381: function (ifd) { return { tag: 'MaxApertureValue', value: ifd.data[0] } },
  // 37382	9206	SubjectDistance	The distance to the subject, given in meters.
  37382: function (ifd) { return { tag: 'SubjectDistance', value: ifd.data[0] } },
  // 37383	9207	MeteringMode	The metering mode.
  37383: function (ifd) { return { tag: 'MeteringMode', value: ifd.data[0] } },
  // 37384	9208	LightSource	The kind of light source.
  37384: function (ifd) { return { tag: 'LightSource', value: ifd.data[0] } },
  // 37385	9209	Flash	Indicates the status of flash when the image was shot.
  37385: function (ifd) { return { tag: 'Flash', value: ifd.data[0] } },
  // 37386	920A	FocalLength	The actual focal length of the lens, in mm.
  37386: function (ifd) { return { tag: 'FocalLength', value: ifd.data[0] } },
  // 37396	9214	SubjectArea	Indicates the location and area of the main subject in the overall scene.
  37396: function (ifd) { return { tag: 'SubjectArea', value: ifd.data } },
  // 37500	927C	MakerNote	Manufacturer specific information.
  37500: function (ifd) { return { tag: 'MakerNote', value: ifd.data } },
  // 37510	9286	UserComment	Keywords or comments on the image; complements ImageDescription.
  37510: function (ifd) { return { tag: 'UserComment', value: ifd.data.join('') } },
  // 37520	9290	SubsecTime	A tag used to record fractions of seconds for the DateTime tag.
  37520: function (ifd) { return { tag: 'SubsecTime', value: ifd.data.join('') } },
  // 37521	9291	SubsecTimeOriginal	A tag used to record fractions of seconds for the DateTimeOriginal tag.
  37521: function (ifd) { return { tag: 'SubsecTimeOriginal', value: ifd.data.join('') } },
  // 37522	9292	SubsecTimeDigitized	A tag used to record fractions of seconds for the DateTimeDigitized tag.
  37522: function (ifd) { return { tag: 'SubsecTimeDigitized', value: ifd.data.join('') } },
  // 40961	A001	ColorSpace	The color space information tag is always recorded as the color space specifier.
  40961: function (ifd) { return { tag: 'ColorSpace', value: ifd.data[0] } },
  // 40962	A002	PixelXDimension	Specific to compressed data; the valid width of the meaningful image.
  40962: function (ifd) { return { tag: 'PixelXDimension', value: ifd.data[0] } },
  // 40963	A003	PixelYDimension	Specific to compressed data; the valid height of the meaningful image.
  40963: function (ifd) { return { tag: 'PixelYDimension', value: ifd.data[0] } },
  // 41483	A20B	FlashEnergy	Indicates the strobe energy at the time the image is captured, as measured in Beam Candle Power Seconds
  41483: function (ifd) { return { tag: 'FlashEnergy', value: ifd.data[0] } },
  // 41484	A20C	SpatialFrequencyResponse	Records the camera or input device spatial frequency table and SFR values in the direction of image width, image height, and diagonal direction, as specified in ISO 12233.
  41484: function (ifd) { return { tag: 'SpatialFrequencyResponse', value: ifd.data[0] } },
  // 41486	A20E	FocalPlaneXResolution	Indicates the number of pixels in the image width (X) direction per FocalPlaneResolutionUnit on the camera focal plane.
  41486: function (ifd) { return { tag: 'FocalPlaneXResolution', value: ifd.data[0] } },
  // 41487	A20F	FocalPlaneYResolution	Indicates the number of pixels in the image height (Y) direction per FocalPlaneResolutionUnit on the camera focal plane.
  41487: function (ifd) { return { tag: 'FocalPlaneYResolution', value: ifd.data[0] } },
  // 41488	A210	FocalPlaneResolutionUnit	Indicates the unit for measuring FocalPlaneXResolution and FocalPlaneYResolution.
  41488: function (ifd) { return { tag: 'FocalPlaneResolutionUnit', value: ifd.data[0] } },
  // 41492	A214	SubjectLocation	Indicates the location of the main subject in the scene.
  41492: function (ifd) { return { tag: 'SubjectLocation', value: ifd.data } },
  // 41493	A215	ExposureIndex	Indicates the exposure index selected on the camera or input device at the time the image is captured.
  41493: function (ifd) { return { tag: 'ExposureIndex', value: ifd.data } },
  // 41495	A217	SensingMethod	Indicates the image sensor type on the camera or input device.
  41495: function (ifd) { return { tag: 'SensingMethod', value: ifd.data[0] } },
  // 41728	A300	FileSource	Indicates the image source.
  41728: function (ifd) { return { tag: 'FileSource', value: ifd.data } },
  // 41729	A301	SceneType	Indicates the type of scene.
  41729: function (ifd) { return { tag: 'SceneType', value: ifd.data[0] } },
  // 41730	A302	CFAPattern	Indicates the color filter array (CFA) geometric pattern of the image sensor when a one-chip color area sensor is used.
  41730: function (ifd) { return { tag: 'CFAPattern', value: ifd.data } },
  // 41985	A401	CustomRendered	Indicates the use of special processing on image data, such as rendering geared to output.
  41985: function (ifd) { return { tag: 'CustomRendered', value: ifd.data[0] } },
  // 41986	A402	ExposureMode	Indicates the exposure mode set when the image was shot.
  41986: function (ifd) { return { tag: 'ExposureMode', value: ifd.data[0] } },
  // 41987	A403	WhiteBalance	Indicates the white balance mode set when the image was shot.
  41987: function (ifd) { return { tag: 'WhiteBalance', value: ifd.data[0] } },
  // 41988	A404	DigitalZoomRatio	Indicates the digital zoom ratio when the image was shot.
  41988: function (ifd) { return { tag: 'DigitalZoomRatio', value: ifd.data[0] } },
  // 41989	A405	FocalLengthIn35mmFilm	Indicates the equivalent focal length assuming a 35mm film camera, in mm.
  41989: function (ifd) { return { tag: 'FocalLengthIn35mmFilm', value: ifd.data[0] } },
  // 41990	A406	SceneCaptureType	Indicates the type of scene that was shot.
  41990: function (ifd) { return { tag: 'SceneCaptureType', value: ifd.data[0] } },
  // 41995	A40B	DeviceSettingDescription	This tag indicates information on the picture-taking conditions of a particular camera model.
  41995: function (ifd) { return { tag: 'DeviceSettingDescription', value: ifd.data } },
  // 41996	A40C	SubjectDistanceRange	Indicates the distance to the subject.
  41996: function (ifd) { return { tag: 'SubjectDistanceRange', value: ifd.data } },
  // 42016	A420	ImageUniqueID	Indicates an identifier assigned uniquely to each image.
  42016: function (ifd) { return { tag: 'ImageUniqueID', value: ifd.data } },
}
