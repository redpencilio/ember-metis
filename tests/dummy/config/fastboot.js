module.exports = function (/*environment*/) {
  return {
    buildSandboxGlobals(defaultGlobals) {
      const devGlobals = {};

      const { METIS_BACKEND_URL } = process.env;

      if (METIS_BACKEND_URL) {
        devGlobals.BACKEND_URL = METIS_BACKEND_URL;
      }

      return {
        ...defaultGlobals,
        ...devGlobals,
      };
    },
  };
};
