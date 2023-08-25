#!/usr/bin/env node
const { execSync } = require('child_process');

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

function getLinesChanged(startTime, endTime) { 
  let directory = process.cwd()
  let authorName = "Alex Reyes"
  // Get lines added + deleted across ALL branches for a specific author (me) within a time range
  let gitHistory = `git log --all --since=\"@${startTime}\" --until=\"@${endTime}\" --author=\"${authorName}\" --shortstat --pretty=format:\"\" | awk '{added+=$4; deleted+=$6} END {print \"{\\\"added\\\": \" added \", \\\"deleted\\\": \" deleted \" }\"}'`

  let output = execSync(`cd ${directory} && ${gitHistory}`)

  try {
    return JSON.parse(output.toString())
  } catch { 
    return false
  }
}

let validTimestamps = getUnixTimestampsForLastXDays(7)

if (validTimestamps.length == 0) { 
  console.log("Empty!")
}
else if (validTimestamps.length == 1) { 
  console.log("HANDLE THIS EDGE CASE LATER!")
} else { 
  var pointer = 0
  var pointer1 = 1

  while (pointer1 <= validTimestamps.length) { 
    let item = formatDateToHumanReadable(convertUnixTimestampToDate(validTimestamps[pointer]))

    let range = `${item}`

    let divider = '='.repeat(24)
    console.log(divider)
    console.log(range + ':', end='\n')

    let output = getLinesChanged(validTimestamps[pointer], validTimestamps[pointer1])
    
    if (!output) { 
      console.log("No commits on this day\n")
    } else { 
      const { added, deleted } = output
      
      console.log("Added: ", added)
      console.log("Deleted: ", deleted)
      console.log("Total: ", added + deleted)
    }

    pointer++;
    pointer1++;
  }
}
