export const executePyCode = {
  name: "executePyCode",
  description: `Execute Python code in a 3ds max instance.

  ## General instructions
  - do not reset the scene as you might delete existing work

  ## 3ds max coords
  x+ right
  y+ forward
  Z+ up

  ## Object creation
  - pivot points are usually at the bottom of the object

  ## instructions for returning values:

  - Return values must be JSON serializable
  -save the result to a "result" variable and return it

  ## When code execution errors
  - If an error occurs in the code execution, try to fix the issue in the python code before trying using the maxscript tool.
  - Only use the maxscript tool if there is a limitation in the python api that is only suppoted in maxscript.
  - instead of giving up the previous code, try to fix it until it works

  ## Common errors:
  - Do not try to import MaxPlus, it is not a real moduleavailable in the python api
  `,
};
