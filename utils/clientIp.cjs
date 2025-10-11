// utils/clientIp.cjs

function getClientIp(req) {
  const cf = req.headers['cf-connecting-ip'] || '';
  if (cf) return cf;

  const xff = req.headers['x-forwarded-for'] || '';
  if (xff) return xff.split(',')[0].trim();

  return req.ip || '';
}

module.exports = { getClientIp };