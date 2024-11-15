import { useEffect, useState } from "react";
import "./style.css";
import Spinner from "./Spinner";

function App() {
  // ُStates
  const [isLoading, setIsLoading] = useState(false);

  const [video, setVideo] = useState();
  const [videoID, setVideoID] = useState();
  const [watermark, setWatermark] = useState();
  const [bitrate, setBitrate] = useState("");
  const [frameRate, setFrameRate] = useState("");
  const [startMin, setStartMin] = useState("");
  const [startSec, setStartSec] = useState("");
  const [endMin, setEndMin] = useState("");
  const [endSec, setEndSec] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);

  const [isFileTrimActive, setIsFileTrimActive] = useState(false);
  const [isFileBitrateActive, setIsFileBitrateActive] = useState(false);
  const [isFileFramerateActive, setIsFileFramerateActive] = useState(false);
  const [isFileWatermarkActive, setIsFileWatermarkActive] = useState(false);

  function handleUploadVideo(e) {
    setVideo(e.target.files[0]);
  }

  function handleUploadWatermark(e) {
    setWatermark(e.target.files[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    async function postData() {
      try {
        setIsLoading(true);
        const obj = {};

        if (isFileWatermarkActive) {
          const formData = new FormData();
          formData.append("watermark", watermark);
          obj.watermark = formData;
        }

        if (isFileBitrateActive) {
          obj.bitrate = bitrate;
        }

        if (isFileFramerateActive) {
          obj.framerate = +frameRate;
        }

        if (isFileTrimActive) {
          const end = +endMin * 60 + Number(endSec);
          const start = +startMin * 60 + Number(startSec);
          obj["trim[duration]"] = end;
          obj["trim[start]"] = start;
        }

        const res = await fetch(
          `https://6b82-178-173-170-5.ngrok-free.app/api/${videoID}/edit`,
          {
            method: "POST",
            body: new URLSearchParams(obj),
          }
        );
        const data = await res.json();
        setDownloadLink(
          `https://6b82-178-173-170-5.ngrok-free.app/${data.download_path}`
        );
        console.log(data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
    postData();
  }

  useEffect(
    function () {
      if (!video) return;
      async function postVideo() {
        try {
          setIsLoading(true);
          const formData = new FormData();
          formData.append("video", video);
          const res = await fetch(
            "https://6b82-178-173-170-5.ngrok-free.app/api/upload",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await res.json();
          setVideoID(data.video_id);
          console.log(data);
          if (data.video_id) {
            const getVideoData = await fetch(
              `https://6b82-178-173-170-5.ngrok-free.app/api/${data.video_id}/information`
            );
            const videoData = await getVideoData.json();
            setBitrate(videoData.bitrate);
            const fRate = videoData.frame_rate.replace("/", ".");
            setFrameRate(fRate);
            console.log(videoData);
          }
        } catch (err) {
          console.log(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      const controller = new AbortController();
      postVideo(controller);

      return () => {
        controller.abort();
      };
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
            // accept="video/*"
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
                  onChange={(e) => setIsFileTrimActive((c) => !c)}
                />
                <label htmlFor="changeDuration">اعمال برش</label>
              </div>
              <div>
                <label htmlFor="startMin">زمان شروع</label>
                <input
                  id="startMin"
                  type="number"
                  placeholder="دقیقه"
                  value={startMin}
                  onChange={(e) => setStartMin(e.target.value)}
                  disabled={!isFileTrimActive}
                />
                <input
                  id="startSec"
                  type="number"
                  placeholder="ثانیه"
                  value={startSec}
                  onChange={(e) => setStartSec(e.target.value)}
                  disabled={!isFileTrimActive}
                />
              </div>
              <div>
                <label htmlFor="endMin">زمان پایان</label>
                <input
                  id="endMin"
                  type="number"
                  placeholder="دقیقه"
                  value={endMin}
                  onChange={(e) => setEndMin(e.target.value)}
                  disabled={!isFileTrimActive}
                />
                <input
                  id="endSec"
                  type="number"
                  placeholder="ثانیه"
                  value={endSec}
                  onChange={(e) => setEndSec(e.target.value)}
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
                  onChange={(e) => setIsFileBitrateActive((c) => !c)}
                />
                <label htmlFor="changeBitrate">تغییر بیت ریت</label>
              </div>
              <input
                id="setBitrate"
                type="number"
                placeholder="بیت ریت"
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                disabled={!isFileBitrateActive}
              />
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="changeFramerate"
                  checked={isFileFramerateActive}
                  onChange={(e) => setIsFileFramerateActive((c) => !c)}
                />
                <label htmlFor="changeFramerate">تغییر فریم ریت</label>
              </div>
              <input
                id="setFramerate"
                type="number"
                placeholder="فریم ریت"
                value={frameRate}
                onChange={(e) => setFrameRate(e.target.value)}
                disabled={!isFileFramerateActive}
              />
            </div>
            <div>
              <div>
                <input
                  type="checkbox"
                  id="changeWatermark"
                  checked={isFileWatermarkActive}
                  onChange={(e) => setIsFileWatermarkActive((c) => !c)}
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
              <div>
                <a href={downloadLink}>دانلود خروجی</a>
              </div>
            )}
          </>
        )}
      </form>
    </main>
  );
}

export default App;
