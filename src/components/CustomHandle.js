import { useEffect } from "react"
import { Handle, useUpdateNodeInternals } from "react-flow-renderer"

export const CustomHandle = props => {
  const updateNodeInternals = useUpdateNodeInternals()

  useEffect(() => {
    updateNodeInternals(props.id)
  }, [props.id, updateNodeInternals])

  return <Handle {...props} />
}
