const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const path = require('path');

exports.captureSnapshot = (rtsp, res) => {
  try {
    const stream = new PassThrough();
    res.type('image/jpeg');

    // Set default resolution to 1080p if not provided
    const resolution = Array.isArray(res.resolution) && res.resolution.length === 2
      ? res.resolution
      : [1920, 1080];

    // Build filter chain
    const filters = [
      'fps=1', // Reduce frame rate
      'eq=contrast=1.2:brightness=0.05:saturation=1.3', // Color adjustments
      `scale=${resolution[0]}:${resolution[1]}`, // Force resolution
    ];

    // FFmpeg processing pipeline
    ffmpeg(rtsp)
      .inputOptions([
        '-rtsp_transport tcp', // Force TCP transport for stability
        '-timeout 5000000', // 5 second timeout
        '-analyzeduration 10000000', // Increase analysis duration
      ])
      .outputOptions([
        `-vf ${filters.join(',')}`,
        '-frames:v 1', // Capture exactly 1 frame
        '-ss 00:00:01', // Seek to 1 second
        '-q:v 2', // Quality level (2-31, lower is better)
        '-f image2', // Output as image
      ])
      .on('start', (command) => {
        console.log('FFmpeg command:', command);
      })
      .on('error', (err) => {
        console.error("FFmpeg error:", err.message);
        
        let statusCode = 500;
        let errorMessage = "Failed to capture snapshot";
        let errorCode = "UNKNOWN_ERROR";
        
        if (err.message.includes("401 Unauthorized") || 
            err.message.includes("authorization failed")) {
          statusCode = 401;
          errorMessage = "Authentication failed: Invalid camera credentials";
          errorCode = "AUTH_ERROR";
        } else if (err.message.includes("Connection refused")) {
          statusCode = 503;
          errorMessage = "Camera unavailable or connection refused";
          errorCode = "CONNECTION_ERROR";
        } else if (err.message.includes("Invalid data found")) {
          statusCode = 400;
          errorMessage = "Invalid stream data";
          errorCode = "STREAM_ERROR";
        }

        if (!res.headersSent) {
          res.status(statusCode).json({
            error: true,
            message: errorMessage,
            code: errorCode,
            details: err.message
          });
        }
      })
      .on('end', () => {
        console.log('Snapshot captured successfully');
      })
      .pipe(stream, { end: true });

    stream.pipe(res);
  } catch (err) {
    console.error("Unexpected error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: true,
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        details: err.message
      });
    }
  }
};
// exports.captureSnapshot = (rtsp, res) => {
//   try {
//     const stream = new PassThrough();
//     res.type('image/jpeg');
//     const hasResolution = Array.isArray(res.resolution) && res.resolution.length === 2;
//     const filters = [
//       'fps=1', // Reduce frame rate first (efficiency)
//       'eq=contrast=1.2:brightness=0.05:saturation=1.3', // Apply color adjustments
//       hasResolution && `scale=${res.resolution[0]}:${res.resolution[1]}`, // Force exact resolution (may stretch)
//     ].filter(Boolean); // Remove `false` if resolution is missing
//     ffmpeg(rtsp)
//       .inputOptions('-rtsp_transport tcp')
//       .outputOptions([
//         // Improve image quality with filters
//         // '-vf fps=1,eq=contrast=1.2:brightness=0.05:saturation=1.3',
//         `-vf ${filters.join(',')}`,
//         '-t 1',
//         '-ss 00:00:01'
//       ])
//       .frames(1)
//       .format('image2')
//       .outputOptions('-q:v 2')
//       .on('error', err => {
//         console.error("FFmpeg error:", err.message);
        
//         let statusCode = 500;
//         let errorMessage = "Failed to capture snapshot";
//         let errorCode = "UNKNOWN_ERROR";
        
//         // Enhanced error message parsing
//         if (err.message.includes("401 Unauthorized") || 
//             err.message.includes("authorization failed")) {  // Add this condition
//           statusCode = 401;
//           errorMessage = "Authentication failed: Invalid camera credentials";
//           errorCode = "AUTH_ERROR";
//         }
//         // ... other error conditions ...

//         if (!res.headersSent) {
//           res.status(statusCode).json({
//             error: true,
//             message: errorMessage,
//             code: errorCode,
//             details: err.message
//           });
//         }
//       })
//       .pipe(stream);

//     stream.pipe(res);
//   } catch (err) {
//     // ... existing error handling ...
//   }
// };

///////==========TEST==============
//video



// exports.captureSnapshot = (videoPath, res) => {
//   try {
//     const stream = new PassThrough();
//     res.type('image/jpeg');

//     ffmpeg(videoPath)  // สามารถใช้ path แทน RTSP ได้เลย
//       .outputOptions(['-vf fps=1', '-t 1', '-ss 00:00:01'])
//       .frames(1)
//       .format('image2')
//       .outputOptions('-q:v 2')
//       .on('error', err => {
//         console.error("FFmpeg error:", err);
//         if (!res.headersSent) res.status(500).send("Snapshot failed");
//       })
//       .pipe(stream);

//     stream.pipe(res);
//   } catch (err) {
//     if (!res.headersSent) res.status(500).send("Internal server error");
//     throw err;
//   }
// };
