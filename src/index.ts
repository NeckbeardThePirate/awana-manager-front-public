export default {
  fetch: (req: Request, env: Env) => {
    return env.ASSETS.fetch(req);
  },
};

//asdf