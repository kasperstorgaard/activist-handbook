import {message, danger} from "danger";

const modifiedFiles = danger.git.modified_files
    .map(file => `- ${file}`)
    .join('\n');

message("Changed Files in this PR: \n" + modifiedFiles);