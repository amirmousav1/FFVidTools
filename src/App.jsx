import { useEffect, useReducer } from "react";
import "./style.css";
import Spinner from "./Spinner";

const API_URL = "http://147.78.0.23";

const initialState = {
  isLoading: false,
  video: null,
  videoID: null,
  watermark: null,
  bitrate: "",
  frameRate: "",
  trimStartMin: "",
  trimStartSec: "",
  trimDurationMin: "",
  trimDurationSec: "",
  downloadLink: null,
  isFileTrimActive: false,
  isFileBitrateActive: false,
  isFileFramerateActive: false,
  isFileWatermarkActive: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "notLoading":
      return { ...state, isLoading: false };

    case "error/set":
      return { ...state, error: action.payload };

    case "error/clear":
      return { ...state, error: null };

    case "video/upload":
      return { ...state, video: action.payload };

    case "video/setID":
      return { ...state, videoID: action.payload };

    case "watermark/upload":
      return { ...state, watermark: action.payload };

    case "bitrate/set":
      return { ...state, bitrate: action.payload };

    case "framerate/set":
      return { ...state, frameRate: action.payload };

    case "trimStartMin/set":
      return { ...state, trimStartMin: action.payload };

    case "trimStartSec/set":
      return { ...state, trimStartSec: action.payload };

    case "trimDurationMin/set":
      return { ...state, trimDurationMin: action.payload };

    case "trimDurationSec/set":
      return { ...state, trimDurationSec: action.payload };

    case "downloadLink/set":
      return { ...state, downloadLink: action.payload };

    case "downloadLink/clear":
      return { ...state, downloadLink: null };

    case "isFileTrimActive/toggle":
      return { ...state, isFileTrimActive: !state.isFileTrimActive };

    case "isFileBitrateActive/toggle":
      return { ...state, isFileBitrateActive: !state.isFileBitrateActive };

    case "isFileFramerateActive/toggle":
      return { ...state, isFileFramerateActive: !state.isFileFramerateActive };

    case "isFileWatermarkActive/toggle":
      return { ...state, isFileWatermarkActive: !state.isFileWatermarkActive };

    default:
      return state;
  }
}

function App() {
  const [
    {
      isLoading,
      video,
      videoID,
      watermark,
      bitrate,
      frameRate,
      trimStartMin,
      trimStartSec,
      trimDurationMin,
      trimDurationSec,
      downloadLink,
      isFileTrimActive,
      isFileBitrateActive,
      isFileFramerateActive,
      isFileWatermarkActive,
      error,
    },
    dispatch,
  ] = useReducer(reducer, initialState);

  function handleUploadVideo(e) {
    dispatch({ type: "video/upload", payload: e.target.files[0] });
  }

  function handleUploadWatermark(e) {
    dispatch({ type: "watermark/upload", payload: e.target.files[0] });
  }

  function handleSubmit(e) {
    e.preventDefault();
    async function postData() {
      try {
        dispatch({ type: "error/clear" });
        dispatch({ type: "loading" });

        const formData = new FormData();

        if (isFileWatermarkActive) {
          formData.append("watermark", watermark);
        }

        if (isFileBitrateActive) {
          formData.append("bitrate", bitrate);
        }

        if (isFileFramerateActive) {
          formData.append("framerate", +frameRate);
        }

        if (isFileTrimActive) {
          const duration = +trimDurationMin * 60 + Number(trimDurationSec);
          const start = +trimStartMin * 60 + Number(trimStartSec);
          formData.append("trim[duration]", duration);
          formData.append("trim[start]", start);
        }

        const res = await fetch(`${API_URL}/api/${videoID}/edit`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.download_path) {
          dispatch({
            type: "downloadLink/set",
            payload: `${API_URL}/${data.download_path}`,
          });
        }
        if (data.error) {
          dispatch({ type: "error/set", payload: data.error });
          dispatch({ type: "downloadLink/clear" });
        }
        console.log(data);
      } catch (err) {
        console.log(err);
      } finally {
        dispatch({ type: "notLoading" });
      }
    }
    postData();
  }

  useEffect(
    function () {
      if (!video) return;
      async function postVideo() {
        dispatch({ type: "loading" });
        try {
          const formData = new FormData();
          formData.append("video", video);
          const res = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          dispatch({ type: "video/setID", payload: data.video_id });
          console.log(data);
          if (data.video_id) {
            const getVideoData = await fetch(
              `${API_URL}/api/${data.video_id}/information`
            );
            const videoData = await getVideoData.json();
            dispatch({ type: "bitrate/set", payload: videoData.bitrate });
            const formattedFrameRate = Number(
              videoData.frame_rate.replace("/", ".")
            );
            dispatch({ type: "framerate/set", payload: formattedFrameRate });
            console.log(videoData);
          }
        } catch (err) {
          console.log(err.message);
          dispatch({ type: "error/set", payload: err.message });
        } finally {
          dispatch({ type: "notLoading" });
        }
      }
      postVideo();
    },
    [video]
  );

  return (
    <main className="container">
      {isLoading && <Spinner />}
      <form className="form">
        <div>
          <label htmlFor="selectFile">فایل مورد نظر خود را انتخاب کنید</label>
          <input
            id="selectFile"
            type="file"
            onChange={handleUploadVideo}
            accept="video/*"
          />
        </div>
        {video && (
          <>
            <div className="trim">
              <div>
                <input
                  type="checkbox"
                  id="changeDuration"
                  checked={isFileTrimActive}
                  onChange={() => dispatch({ type: "isFileTrimActive/toggle" })}
                />
                <label htmlFor="changeDuration">اعمال برش</label>
              </div>
              <div>
                <label htmlFor="startMin">زمان شروع</label>
                <input
                  id="startMin"
                  type="number"
                  placeholder="دقیقه"
                  value={trimStartMin}
                  onChange={(e) =>
                    dispatch({
                      type: "trimStartMin/set",
                      payload: e.target.value,
                    })
                  }
                  disabled={!isFileTrimActive}
                />
                <input
                  id="startSec"
                  type="number"
                  placeholder="ثانیه"
                  value={trimStartSec}
                  onChange={(e) =>
                    dispatch({
                      type: "trimStartSec/set",
                      payload: e.target.value,
                    })
                  }
                  disabled={!isFileTrimActive}
                />
              </div>
              <div>
                <label htmlFor="endMin">مدت زمان</label>
                <input
                  id="endMin"
                  type="number"
                  placeholder="دقیقه"
                  value={trimDurationMin}
                  onChange={(e) =>
                    dispatch({
                      type: "trimDurationMin/set",
                      payload: e.target.value,
                    })
                  }
                  disabled={!isFileTrimActive}
                />
                <input
                  id="endSec"
                  type="number"
                  placeholder="ثانیه"
                  value={trimDurationSec}
                  onChange={(e) =>
                    dispatch({
                      type: "trimDurationSec/set",
                      payload: e.target.value,
                    })
                  }
                  disabled={!isFileTrimActive}
                />
              </div>
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="changeBitrate"
                  checked={isFileBitrateActive}
                  onChange={() =>
                    dispatch({ type: "isFileBitrateActive/toggle" })
                  }
                />
                <label htmlFor="changeBitrate">تغییر بیت ریت</label>
              </div>
              <input
                id="setBitrate"
                type="number"
                placeholder="بیت ریت"
                value={bitrate}
                onChange={(e) =>
                  dispatch({ type: "bitrate/set", payload: e.target.value })
                }
                disabled={!isFileBitrateActive}
              />
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="changeFramerate"
                  checked={isFileFramerateActive}
                  onChange={() =>
                    dispatch({ type: "isFileFramerateActive/toggle" })
                  }
                />
                <label htmlFor="changeFramerate">تغییر فریم ریت</label>
              </div>
              <input
                id="setFramerate"
                type="number"
                placeholder="فریم ریت"
                value={frameRate}
                onChange={(e) =>
                  dispatch({ type: "framerate/set", payload: e.target.value })
                }
                disabled={!isFileFramerateActive}
              />
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="changeWatermark"
                  checked={isFileWatermarkActive}
                  onChange={() =>
                    dispatch({ type: "isFileWatermarkActive/toggle" })
                  }
                />
                <label htmlFor="changeWatermark">انتخاب واترمارک</label>
              </div>
              <input
                accept="image/*"
                id="selectWatermark"
                type="file"
                onChange={handleUploadWatermark}
                disabled={!isFileWatermarkActive}
              />
            </div>
            <button className="btn" onClick={handleSubmit}>
              ارسال
            </button>
            {downloadLink && (
              <div className="success">
                <a href={downloadLink}>دانلود خروجی</a>
              </div>
            )}
            {error && (
              <div className="error">
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </form>
    </main>
  );
}

export default App;
