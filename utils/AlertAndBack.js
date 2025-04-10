export default function alertAndBack(res, message) {
  res.send(`<script>alert("${message}"); window.history.back();</script>`);
}
