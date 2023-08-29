#!/usr/bin/env node
const { execSync } = require('child_process');

// Filter diffs by name
const AUTHOR_NAME = "Alex Reyes"
const BUILDBOT_AUTHOR_NAME = "buildbot"

// Helper function get unix timestamps for midnight in the last 7 days
function getUnixTimestampsForLastXDays(num) { 
  var timestamps = [];

  for (let i = 0; i < num; i++) { 
    const date = new Date();

    date.setDate(date.getDate() - i)

    // Midnight
    date.setHours(0, 0, 0, 0)

    const unixTimestamp = Math.floor(date.getTime() / 1000);
    timestamps.push(unixTimestamp)
  }
  return timestamps.reverse()
}

function convertUnixTimestampToDate(unixTimestamp) {
  // Need to multiply by 1000 because Date expects unix timestamps in milliseconds
  return new Date(unixTimestamp * 1000);
}

// Function to get a JS date and convert to this format: Tuesday, August 22nd
function formatDateToHumanReadable(date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const dayOfWeek = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const dayOfMonth = date.getDate();

  let suffix = "th";
  if (dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31) {
      suffix = "st";
  } else if (dayOfMonth === 2 || dayOfMonth === 22) {
      suffix = "nd";
  } else if (dayOfMonth === 3 || dayOfMonth === 23) {
      suffix = "rd";
  }

  return `${dayOfWeek}, ${monthName} ${dayOfMonth}${suffix}`;
}

// startTime + endTime are unix timestamps
function getLinesChanged(startTime, endTime) { 
  let currDir = process.cwd()

  // Get lines added + deleted across ALL branches for a specific author (me) within a time range
  let gitLinesChangedCommand = `git log --all --since=\"@${startTime}\" --until=\"@${endTime}\" --author=\"${AUTHOR_NAME}\" --author=\"${BUILDBOT_AUTHOR_NAME}\" --shortstat --pretty=format:\"\" | awk '{added+=$4; deleted+=$6} END {print \"{\\\"added\\\": \" added \", \\\"deleted\\\": \" deleted \" }\"}'`

  // Returns a string like: {"added": 47, "deleted": 10 }
  let output = execSync(`cd ${currDir} && ${gitLinesChangedCommand}`)

  try {
    return JSON.parse(output.toString())
  } catch { 
    return false
  }
}

function main() { 
  let lastWeekInUnixTimestamps = getUnixTimestampsForLastXDays(8)

  var pointer = 0
  var pointer1 = 1

  // Need to get the ranges to calculate the loc changed
  // Use two pointers to loop through the array 2 items at a time. Item 1 is the starting time, item 2 is the ending time
  while (pointer1 <= lastWeekInUnixTimestamps.length) { 
    let humanReadableDate = formatDateToHumanReadable(convertUnixTimestampToDate(lastWeekInUnixTimestamps[pointer]))

    console.log('='.repeat(24))
    console.log(`${humanReadableDate}:\n`)

    const startTime = lastWeekInUnixTimestamps[pointer]
    const endTime = lastWeekInUnixTimestamps[pointer1]

    let linesChangedObj = getLinesChanged(startTime, endTime)
    
    if (!linesChangedObj) { 
      console.log("No commits on this day\n")
    } else { 
      const { added, deleted } = linesChangedObj
      
      console.log(`Added: ${added}`)
      console.log(`Deleted: ${deleted}`)
      console.log(`Total: ${added + deleted}\n`)
    }

    pointer++;
    pointer1++;
  }
}

main()