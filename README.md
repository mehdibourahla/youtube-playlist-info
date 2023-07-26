# YouTube Playlist Info

## Project Overview

This is a web application that allows users to fetch information about YouTube playlists. The app utilizes YouTube's Data API to retrieve data such as video titles, descriptions, tags, and more. It also incorporates a YouTube player that plays videos in a given playlist and allows a set delay between videos.

## Features

- Fetching a playlist's information given the playlist ID
- Fetching additional video information such as description, tags, duration, age restrictions, and more
- Fetching video transcript using a third-party API
- Playing videos in a given playlist with a set delay between each video
- Exporting the fetched playlist information to a CSV file

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js installed on your local machine. You can download it here.

### Installation

- Clone the repository:

```bash
  git clone https://github.com/yourusername/youtube-playlist-info.git
```

```bash
  cd youtube-playlist-info
```

- Install the required packages:

```bash
  npm install
```

## Usage

Enter your YouTube API key and the ID of the playlist you wish to fetch information for. Then click 'Get Playlist Info'. Once the data is fetched, it will be displayed in a table. You can also click 'Export to CSV' to download a CSV file with the fetched data.

## Deployment

This application is suitable for deployment on platforms that support back-end server processes, such as Heroku or Vercel.

## Built With

- Node.js - JavaScript runtime
- Express.js - Web application framework
- YouTube Data API - Used to fetch playlist and video data
- youtube-transcript - Used to fetch video transcripts
