let playlistData = [];

async function fetchPlaylistInfo() {
  const apiKey = document.getElementById("apiKey").value;
  const playlistId = document.getElementById("playlistId").value;
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails,status&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  // Show the loading animation
  document.getElementById("loading").style.display = "block";

  const response = await fetch(url);
  const data = await response.json();

  playlistData = []; // clear previous data

  for (let item of data.items) {
    const videoId = item.snippet.resourceId.videoId;
    const videoInfo = await fetchVideoInfo(videoId, apiKey);
    let videoTranscriptResponse = await fetchTranscript(videoId);
    let videoTranscript = "Not available";
    if (videoTranscriptResponse) {
      // Concatenate all text fields into a single string
      videoTranscript = videoTranscriptResponse
        .map((line) => line.text)
        .join(" ");
    }
    const videoData = {
      videoId: videoId,
      videoTitle: videoInfo.items[0].snippet.title,
      videoDescription: videoInfo.items[0].snippet.description,
      videoPublishedAt: videoInfo.items[0].snippet.publishedAt,
      videoChannelId: videoInfo.items[0].snippet.channelId,
      videoChannelTitle: videoInfo.items[0].snippet.channelTitle,
      videoTags: videoInfo.items[0].snippet.tags
        ? videoInfo.items[0].snippet.tags.join(",")
        : "No Tags",
      videoCategoryId: videoInfo.items[0].snippet.categoryId,
      videoLiveBroadcastContent:
        videoInfo.items[0].snippet.liveBroadcastContent,
      videoDefaultLanguage:
        videoInfo.items[0].snippet.defaultLanguage || "No Default Language",
      videoDuration: videoInfo.items[0].contentDetails.duration,
      videoCaption: videoInfo.items[0].contentDetails.caption,
      videoLicensedContent: videoInfo.items[0].contentDetails.licensedContent,
      videoEmbeddable: videoInfo.items[0].status.embeddable,
      videoMadeForKids: videoInfo.items[0].status.madeForKids ? "Yes" : "No",
      videoTranscript: videoTranscript,
    };

    if (!videoData.videoEmbeddable) {
      const errorElement = document.getElementById("error");
      errorElement.textContent = `The video with ID "${videoData.videoId}" and title "${videoData.videoTitle}" is not embeddable. Please remove it from the playlist.`;
      errorElement.style.display = "block";
      return; // Exit the function if a non-embeddable video is found
    }

    playlistData.push(videoData);
  }
  // Hide the loading animation
  document.getElementById("loading").style.display = "none";

  displayPlaylistInfo();
  loadPlaylistPlayer();
}

async function fetchVideoInfo(videoId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${videoId}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return data;
}

function displayPlaylistInfo() {
  const playlistInfoContainer = document.getElementById("playlistInfo");
  playlistInfoContainer.innerHTML = ""; // clear previous data

  // create table headers
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = [
    "videoId",
    "videoTitle",
    "videoChannelTitle",
    "videoDuration",
  ];

  headers.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key.replace(/([a-z])([A-Z])/g, "$1 $2");
    th.className = "table-cell";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  playlistInfoContainer.appendChild(thead);

  // create table body
  const tbody = document.createElement("tbody");
  playlistData.forEach((item) => {
    const row = document.createElement("tr");
    for (let key of headers) {
      // Use the same headers for creating the cells
      const td = document.createElement("td");
      td.textContent = item[key];
      td.className = "table-cell";
      row.appendChild(td);
    }
    tbody.appendChild(row);
  });
  playlistInfoContainer.appendChild(tbody);
}

function exportToCSV() {
  const keys = Object.keys(playlistData[0]);
  let csvContent = keys.map((key) => `"${key}"`).join(",") + "\n"; // wrap keys in double quotes

  playlistData.forEach((item) => {
    let row = keys
      .map((key) => {
        let val = item[key];
        if (val == null) {
          // if value is null or undefined
          return "";
        }
        // wrap values in double quotes and escape any existing double quotes
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(",");
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "playlist_info.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function fetchTranscript(videoId) {
  return fetch(`/transcript/${videoId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      // Returning null when there's an error
      return null;
    });
}

function loadPlaylistPlayer() {
  const playlistId = document.getElementById("playlistId").value;

  // Create a new player
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    playerVars: {
      listType: "playlist",
      list: playlistId,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // Start playing the first video in the playlist after a 30 second delay
  if (playlistData.length > 0) {
    // Set delay time before first video in milliseconds (1000 ms = 1 sec)
    let delayTime = 30000; // 30 seconds
    let countdownTime = delayTime / 1000; // convert to seconds for display
    const countdownElement = document.getElementById("countdown");

    const intervalId = setInterval(() => {
      countdownElement.innerText = `First video will start in ${countdownTime} seconds...`;
      countdownTime -= 1;
      if (countdownTime < 0) {
        clearInterval(intervalId);
        countdownElement.innerText = "";
      }
    }, 1000);

    setTimeout(() => {
      event.target.loadVideoById(playlistData[0].videoId);
    }, delayTime);
  }
}

// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  // If the current video ended, play the next one
  if (event.data == YT.PlayerState.ENDED) {
    for (let i = 0; i < playlistData.length; i++) {
      if (
        playlistData[i].videoId === player.getVideoData().video_id &&
        i < playlistData.length - 1
      ) {
        // Set delay time between each video in milliseconds (1000 ms = 1 sec)
        let delayTime = 30000; // 30 seconds
        let countdownTime = delayTime / 1000; // convert to seconds for display
        const countdownElement = document.getElementById("countdown");

        const intervalId = setInterval(() => {
          countdownElement.innerText = `Next video in ${countdownTime} seconds...`;
          countdownTime -= 1;
          if (countdownTime < 0) {
            clearInterval(intervalId);
            countdownElement.innerText = "";
          }
        }, 1000);

        setTimeout(() => {
          player.loadVideoById(playlistData[i + 1].videoId);
        }, delayTime);

        break;
      }
    }
  }
}
