// eslint-disable-next-line prefer-regex-literals
const emailRegexp = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

const validateRegisterParams = (params) => {
  const msg = {
    is_valid: false,
    error_msgs: [],
  };

  if (!params) {
    msg.error_msgs.push('No parameter asigned.');
    return msg;
  }

  if (typeof params.email !== 'string' || params.email === '' || !emailRegexp.test(params.email)) msg.error_msgs.push('Invalid email');
  if (typeof params.password !== 'string' || params.password === '') msg.error_msgs.push('Invalid password');
  if (typeof params.phone !== 'string' || params.phone === '') msg.error_msgs.push('Invalid phone number');
  if (typeof params.firstname !== 'string' || params.firstname === '') msg.error_msgs.push('Invalid first name');
  if (typeof params.lastname !== 'string' || params.lastname === '') msg.error_msgs.push('Invalid last name');

  if (msg.error_msgs.length === 0) {
    msg.is_valid = true;
  }
  return msg;
};

const validateBlogParams = (params) => {
  const msg = {
    is_valid: false,
    error_msgs: [],
  };

  if (!params) {
    msg.error_msgs.push('No parameter asigned.');
    return msg;
  }

  if (typeof params.title !== 'string' || params.title === '') msg.error_msgs.push('Invalid title');
  if (typeof params.banner !== 'string' || params.banner === '') msg.error_msgs.push('Invalid title');
  if (typeof params.content !== 'string' || params.content === '') msg.error_msgs.push('Invalid content');

  if (msg.error_msgs.length === 0) {
    msg.is_valid = true;
  }
  return msg;
};

const validateCommentParams = (params) => {
  const msg = {
    is_valid: false,
    error_msgs: [],
  };

  if (!params) {
    msg.error_msgs.push('No parameter asigned.');
    return msg;
  }

  if (typeof params.comment !== 'string' || params.comment === '') msg.error_msgs.push('Invalid title');

  if (msg.error_msgs.length === 0) {
    msg.is_valid = true;
  }
  return msg;
};
module.exports = {
  validateRegisterParams,
  validateBlogParams,
  validateCommentParams,
};
