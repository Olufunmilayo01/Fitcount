package repository

import (
	"encoding/json"
	"strconv"
	"strings"
)

func intToStr(i int) string {
	return strconv.Itoa(i)
}

func joinStrings(parts []string) string {
	return strings.Join(parts, ", ")
}

func jsonMarshal(v any) ([]byte, error) {
	return json.Marshal(v)
}
