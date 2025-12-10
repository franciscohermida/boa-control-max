export const executeMxsCode = {
  name: "executeMxsCode",
  description: `Execute MaxScript code in a 3ds max instance.

  ** Prioritize using python for 3ds max scripting. Use maxscript only for tasks that are not possible with python. **

  ## General instructions
  - do not reset the scene as you might delete existing work

  ## 3ds max coords
  x+ right
  y+ forward
  Z+ up

  ## Object creation
  - pivot points are usually at the bottom of the object

  ## general code instructions
  - enclose in () scope to avoid problems when using local variables and not accessing global variables

  ## instructions for returning values:
  - To return a value in maxscript just leaving the value as the last line in the () scope, do not use "return" keyword
  - Return values must be JSON serializable objects and arrays exclusively via python values
  - for strings, numbers, booleans etc, just leave maxscript value as the last line.
  - for objects use OrderedDict.
    Example:
    (
      local pcols = python.import "collections"
      local result = pcols.OrderedDict()
      result["a"] = "myData"  
      result["b"] = pcols.OrderedDict()
      result["b"]["c"] = "myData2"

      -- leave result as last line
      result
    )

  - for arrays use python lists.
    Example:
    (
      pbi = python.import "builtins"
      local result = pbi.list()
      result.append "myData"
      
      -- leave result as last line
      result
    )

  - never return non json serializable values from maxscript as it will break the serialization

  - when creating objects, add the list of object names to the result
    Example:
    (
      pbi = python.import "builtins"
      local pcols = python.import "collections"
      local result = pcols.OrderedDict()
      result["createdObjects"] = pbi.list()
      for (obj in createdObjects) do (
        result["createdObjects"].append obj.name
      )

      -- leave result as last line
      result
    )

  - if for looping through a python list you must do it like this:
    (
      pbi = python.import "builtins"
      local list = pbi.list()
      -- cast as array otherwise it will not iterate
      for (obj in list as array) do (
        print obj
      )
    )

  ## Common errors:
  - the "objects" keyword is reserved and has all the objects in the scene, don't try to define a variable with this reserved word
  - when grouping objects the syntax is: group myArrayOfObjects
  - when grouping do not use this wrong syntax: group (objects (for obj in myArrayOfObjects collect obj))
  `,
};
