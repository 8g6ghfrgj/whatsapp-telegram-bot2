const replies = {
  private: {
    enabled: false,
    text: null
  },
  group: {
    enabled: false,
    text: null
  }
};

function setPrivateReply(text) {
  replies.private.text = text;
  replies.private.enabled = true;
}

function setGroupReply(text) {
  replies.group.text = text;
  replies.group.enabled = true;
}

function disablePrivateReply() {
  replies.private.enabled = false;
}

function disableGroupReply() {
  replies.group.enabled = false;
}

function getReplies() {
  return replies;
}

module.exports = {
  setPrivateReply,
  setGroupReply,
  disablePrivateReply,
  disableGroupReply,
  getReplies
};
